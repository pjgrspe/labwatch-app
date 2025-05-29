// labwatch-app/modules/rooms/components/RoomList.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Room } from '@/types/rooms';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { RoomService } from '../services/RoomService';

type SortOption = 'name' | 'location' | 'status';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  option: SortOption;
  direction: SortDirection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Filter Chip Component
const FilterChip: React.FC<{
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  showSortDirection?: boolean;
  sortDirection?: SortDirection;
}> = React.memo(({ label, icon, isActive, onPress, showSortDirection, sortDirection }) => {
  const activeColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'icon');
  const activeBackgroundColor = useThemeColor({light: Colors.light.tint + '15', dark: Colors.dark.tint + '20'}, 'background');
  const inactiveBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary}, 'surfaceSecondary');
  const borderColor = useThemeColor({}, 'borderColor');

  const colors = useMemo(() => ({
    activeColor,
    inactiveColor,
    activeBackgroundColor,
    inactiveBackgroundColor,
    borderColor,
  }), [activeColor, inactiveColor, activeBackgroundColor, inactiveBackgroundColor, borderColor]);

  return (
    <TouchableOpacity
      style={[
        styles.filterChip,
        {
          backgroundColor: isActive ? colors.activeBackgroundColor : colors.inactiveBackgroundColor,
          borderColor: isActive ? colors.activeColor : colors.borderColor,
          borderWidth: isActive ? 1.5 : 1,
        }
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {icon && (
        <Ionicons 
          name={icon} 
          size={14}
          color={isActive ? colors.activeColor : colors.inactiveColor} 
          style={styles.chipIcon} 
        />
      )}
      <ThemedText style={[
        styles.chipText,
        { color: isActive ? colors.activeColor : colors.inactiveColor }
      ]}>
        {label}
      </ThemedText>
      {showSortDirection && isActive && sortDirection && (
        <Ionicons 
          name={sortDirection === 'asc' ? 'chevron-up' : 'chevron-down'} 
          size={12} 
          color={colors.activeColor} 
          style={styles.sortIcon} 
        />
      )}
    </TouchableOpacity>
  );
});

// Room Item Component
const RoomItem: React.FC<{ item: Room }> = React.memo(({ item }) => {
  const router = useRouter();
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'borderColor');
  
  // Status color based on monitoring state
  const statusColor = item.isMonitored 
    ? useThemeColor({}, 'successText')
    : useThemeColor({}, 'warningText');

  const getStatusIcon = (isMonitored: boolean) => {
    return isMonitored ? 'checkmark-circle' : 'warning';
  };

  const handlePress = useCallback(() => {
    router.push(`/(tabs)/rooms/${item.id}` as any);
  }, [item.id, router]);

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Card style={[
        styles.roomCard,
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderLeftColor: statusColor,
        }
      ]}>
        <ThemedView style={styles.roomCardContent}>
          <ThemedView style={styles.roomHeader}>
            <ThemedView style={[styles.roomIconContainer, { backgroundColor: statusColor + '15' }]}>
              <Ionicons name="business-outline" size={20} color={statusColor} />
            </ThemedView>
            
            <ThemedView style={styles.roomTextContainer}>
              <ThemedText style={[styles.roomTitle, { color: titleColor }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <ThemedView style={styles.roomStatusContainer}>
                <Ionicons 
                  name={getStatusIcon(item.isMonitored)} 
                  size={12} 
                  color={statusColor} 
                />
                <ThemedText style={[styles.roomStatus, { color: statusColor }]}>
                  {item.isMonitored ? "MONITORING" : "PAUSED"}
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.roomMetrics}>
            <ThemedView style={styles.metricItem}>
              <Ionicons name="location-outline" size={16} color={subtitleColor} />
              <ThemedText style={[styles.metricValue, { color: titleColor }]} numberOfLines={1}>
                {item.location}
              </ThemedText>
            </ThemedView>
            
            {item.esp32ModuleName && (
              <>
                <ThemedView style={styles.metricDivider} />
                <ThemedView style={styles.metricItem}>
                  <Ionicons name="hardware-chip-outline" size={16} color={subtitleColor} />
                  <ThemedText style={[styles.metricValue, { color: titleColor }]} numberOfLines={1}>
                    {item.esp32ModuleName}
                  </ThemedText>
                </ThemedView>
              </>
            )}
          </ThemedView>

          <ThemedView style={styles.chevronContainer}>
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={subtitleColor} 
            />
          </ThemedView>
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
});

export default function RoomList() {
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filterAnimation] = useState(new Animated.Value(0));

  const defaultSortOption: SortOption = 'name';
  const defaultSortDirection: SortDirection = 'asc';
  const defaultSortLabel = 'Name';

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    option: defaultSortOption,
    direction: defaultSortDirection,
    label: defaultSortLabel,
    icon: 'text-outline',
  });

  // Theme colors
  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const emptyStateIconColor = useThemeColor({}, 'successText');
  const searchInputBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary }, 'inputBackground');
  const searchInputTextColor = useThemeColor({}, 'text');
  const searchInputBorderColor = useThemeColor({}, 'borderColor');
  const searchIconInputColor = useThemeColor({}, 'icon');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const headerBackgroundColor = useThemeColor({}, 'cardBackground');
  const filterButtonBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary}, 'surfaceSecondary');

  // Toggle filter panel with animation
  const toggleFilters = () => {
    const toValue = isFiltersExpanded ? 0 : 1;
    setIsFiltersExpanded(!isFiltersExpanded);
    
    Animated.timing(filterAnimation, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const fetchRooms = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    
    const unsubscribe = RoomService.onRoomsUpdate(
      (updatedRooms) => {
        setRooms(updatedRooms);
        applyFilters(updatedRooms, searchTerm);
        setError(null);
        if (!isRefresh) setIsLoading(false);
        setRefreshing(false);
      },
      (fetchError: Error) => {
        console.error("Failed to fetch rooms:", fetchError);
        setError("Failed to load rooms. Please try again.");
        if (!isRefresh) setIsLoading(false);
        setRefreshing(false);
      }
    );
    
    return unsubscribe;
  }, [searchTerm]);

  const applyFilters = (roomsList: Room[], search: string) => {
    let filtered = [...roomsList];
    
    // Apply search filter
    if (search.trim() !== '') {
      const lowerSearchTerm = search.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(lowerSearchTerm) ||
        room.location.toLowerCase().includes(lowerSearchTerm) ||
        (room.esp32ModuleName && room.esp32ModuleName.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredRooms(filtered);
  };

  useEffect(() => {
    const unsubscribePromise = fetchRooms();
    return () => {
      unsubscribePromise.then(actualUnsubscribeFn => {
        if (actualUnsubscribeFn) {
          actualUnsubscribeFn();
        }
      }).catch(error => {
        // It's good practice to handle potential errors when resolving the unsubscribe promise
        console.error("Error during room list unsubscription:", error);
      });
    };
  }, [fetchRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRooms(true);
  }, [fetchRooms]);

  useEffect(() => {
    applyFilters(rooms, searchTerm);
  }, [searchTerm, rooms]);

  const sortedRooms = useMemo(() => {
    let sorted = [...filteredRooms];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      if (sortConfig.option === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortConfig.option === 'location') {
        comparison = a.location.localeCompare(b.location);
      } else if (sortConfig.option === 'status') {
        comparison = Number(b.isMonitored) - Number(a.isMonitored);
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredRooms, sortConfig]);

  const sortOptions = [
    { option: 'name' as SortOption, label: 'Name', icon: 'text-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'location' as SortOption, label: 'Location', icon: 'location-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'status' as SortOption, label: 'Status', icon: 'shield-outline' as keyof typeof Ionicons.glyphMap },
  ];

  const handleSortChange = (option: SortOption) => {
    const newDirection = sortConfig.option === option && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    const selectedOption = sortOptions.find(opt => opt.option === option);
    setSortConfig({
      option,
      direction: newDirection,
      label: selectedOption?.label || 'Name',
      icon: selectedOption?.icon || 'text-outline',
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortConfig({
      option: defaultSortOption,
      direction: defaultSortDirection,
      label: defaultSortLabel,
      icon: 'text-outline',
    });
  };

  const hasActiveFilters = searchTerm.trim() !== '' || sortConfig.option !== defaultSortOption || sortConfig.direction !== defaultSortDirection;

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
        <ThemedText style={[styles.loadingText, { color: textColor }]}>
          Loading rooms...
        </ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <Ionicons name="warning-outline" size={64} color={errorColor} />
        <ThemedText style={[styles.errorTitle, { color: errorColor }]}>
          Failed to Load
        </ThemedText>
        <ThemedText style={[styles.errorText, { color: textColor }]}>
          {error}
        </ThemedText>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: tintColor }]}
          onPress={() => fetchRooms()}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh" size={20} color="#FFFFFF" style={styles.buttonIcon} />
          <ThemedText style={[styles.retryButtonText, { color: "#FFFFFF" }]}>
            Try Again
          </ThemedText>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      {/* Enhanced Header */}
      <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
        {/* Search Bar with Filter Toggle */}
        <View style={styles.searchRow}>
          <View style={[styles.searchContainer, {backgroundColor: searchInputBackgroundColor, borderColor: searchInputBorderColor}]}>
            <Ionicons name="search-outline" size={20} color={searchIconInputColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, {color: searchInputTextColor}]}
              placeholder="Search rooms..."
              placeholderTextColor={placeholderTextColor}
              value={searchTerm}
              onChangeText={setSearchTerm}
              returnKeyType="search"
            />
            {searchTerm.length > 0 && (
              <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={20} color={searchIconInputColor} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Toggle Button */}
          <TouchableOpacity 
            style={[
              styles.filterToggleButton, 
              { 
                backgroundColor: isFiltersExpanded ? tintColor : filterButtonBackgroundColor,
                borderColor: isFiltersExpanded ? tintColor : searchInputBorderColor,
              }
            ]}
            onPress={toggleFilters}
            activeOpacity={0.7}
          >
            <Ionicons 
              name={isFiltersExpanded ? "close" : "filter-outline"} 
              size={20} 
              color={isFiltersExpanded ? '#FFFFFF' : searchIconInputColor} 
            />
            {hasActiveFilters && !isFiltersExpanded && (
              <View style={[styles.filterBadge, { backgroundColor: tintColor }]} />
            )}
          </TouchableOpacity>
        </View>

        {/* Animated Filter Panel */}
        <Animated.View 
          style={[
            styles.filterPanel,
            {
              height: filterAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 80],
              }),
              opacity: filterAnimation,
              marginBottom: filterAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, Layout.spacing.sm],
              }),
            }
          ]}
          pointerEvents={isFiltersExpanded ? 'auto' : 'none'}
        >
          {/* Sort Options */}
          <View style={styles.filterSection}>
            <ThemedText style={[styles.filterSectionTitle, { color: searchIconInputColor }]}>
              Sort by
            </ThemedText>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.filterRow}
            >
              {sortOptions.map((option) => (
                <FilterChip
                  key={option.option}
                  label={option.label}
                  icon={option.icon}
                  isActive={sortConfig.option === option.option}
                  onPress={() => handleSortChange(option.option)}
                  showSortDirection={true}
                  sortDirection={sortConfig.option === option.option ? sortConfig.direction : undefined}
                />
              ))}
              
              {hasActiveFilters && (
                <TouchableOpacity 
                  style={[styles.clearFiltersButton, { borderColor: '#FF4444', backgroundColor: '#FF444410' }]}
                  onPress={clearAllFilters}
                  activeOpacity={0.7}
                >
                  <Ionicons name="refresh-outline" size={14} color="#FF4444" />
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </Animated.View>
      </View>

      {/* Content */}
      {sortedRooms.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons 
            name={searchTerm.trim() === '' ? "cube-outline" : "search-outline"} 
            size={70} 
            color={emptyStateIconColor} 
          />
          <ThemedText style={[styles.emptyText, { color: textColor }]}>
            {searchTerm.trim() === '' 
              ? 'No lab rooms yet.\nPress the "+" button to add your first room.' 
              : 'No rooms match your search.'}
          </ThemedText>
          {hasActiveFilters && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={clearAllFilters}
            >
              <ThemedText style={[styles.resetButtonText, { color: tintColor }]}>
                Clear Filters
              </ThemedText>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={sortedRooms}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <RoomItem item={item} />}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor} />
          }
          showsVerticalScrollIndicator={false}
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          initialNumToRender={10}
          windowSize={10}
        />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  errorTitle: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
  },
  errorText: {
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginBottom: Layout.spacing.lg,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.md,
  },
  retryButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
  },
  buttonIcon: {
    marginRight: Layout.spacing.xs,
  },
  emptyText: {
    marginTop: Layout.spacing.lg,
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: Layout.fontSize.lg * 1.4,
  },
  resetButton: {
    marginTop: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
    borderColor: 'currentColor',
  },
  resetButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  
  // Header Styles
  header: {
    paddingTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderColor,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    height: 48,
    marginRight: Layout.spacing.sm,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
  filterToggleButton: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  // Filter Panel
  filterPanel: {
    overflow: 'hidden',
  },
  filterSection: {
    marginBottom: Layout.spacing.sm,
  },
  filterSectionTitle: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
  filterRow: {
    paddingRight: Layout.spacing.md,
    alignItems: 'center',
  },
  
  // Filter Chips
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.pill,
    marginRight: Layout.spacing.xs,
    minHeight: 32,
  },
  chipIcon: {
    marginRight: Layout.spacing.xs / 2,
  },
  sortIcon: {
    marginLeft: Layout.spacing.xs / 2,
  },
  chipText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
  },
  clearFiltersButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
    marginRight: Layout.spacing.xs,
  },
  
  // List Content
  listContent: {
    paddingTop: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xxl + Layout.spacing.lg, // Space for FAB
  },
  
  // Updated Room Item Styles to match dashboard design
  roomItemTouchable: {
    marginBottom: Layout.spacing.sm,
  },
  roomCard: {
    borderLeftWidth: 4,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    ...Layout.cardShadow,
  },
  roomCardContent: {
    padding: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  roomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  roomIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  roomTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roomTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  roomStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  roomStatus: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  roomMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.xs,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  metricValue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
  metricDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: Layout.spacing.md,
  },
  chevronContainer: {
    position: 'absolute',
    right: Layout.spacing.md,
    top: '50%',
    transform: [{ translateY: -8 }],
    opacity: 0.6,
  },
});