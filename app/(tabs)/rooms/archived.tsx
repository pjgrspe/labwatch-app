// labwatch-app/app/(tabs)/rooms/archived.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Colors, Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Rooms } from '@/modules';
import { Room } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  FlatList,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

type SortOption = 'name' | 'location' | 'archivedDate';
type SortDirection = 'asc' | 'desc';

interface SortConfig {
  option: SortOption;
  direction: SortDirection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// Filter Chip Component (similar to alerts)
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
const RoomItem: React.FC<{ 
  item: Room; 
  onRestore: (room: Room) => void;
  onDelete: (room: Room) => void;
}> = React.memo(({ item, onRestore, onDelete }) => {
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const successColor = useThemeColor({}, 'successText');
  const errorColor = useThemeColor({}, 'errorText');
  const borderColor = useThemeColor({}, 'borderColor');

  const handleRestore = useCallback(() => onRestore(item), [item, onRestore]);
  const handleDelete = useCallback(() => onDelete(item), [item, onDelete]);

  const archivedDate = useMemo(() => {
    if (!item.archivedAt) return 'N/A';
    const date = new Date(item.archivedAt as any);
    return date.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [item.archivedAt]);

  return (
    <TouchableOpacity 
      style={styles.roomItemTouchable}
      activeOpacity={0.8}
    >
      <Card style={[
        styles.roomCard,
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderWidth: 1,
          opacity: 0.8, // Slightly faded to show archived state
        }
      ]}>
        <View style={styles.roomContent}>
          <View style={styles.roomIconContainer}>
            <Ionicons 
              name="archive-outline" 
              size={28} 
              color={subtleTextColor}
            />
          </View>
          
          <View style={styles.roomTextContainer}>
            <View style={styles.roomHeader}>
              <ThemedText style={[styles.roomName, { color: titleColor }]} numberOfLines={1}>
                {item.name}
              </ThemedText>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: subtleTextColor + '20' }]}>
                  <Ionicons name="archive" size={12} color={subtleTextColor} />
                  <ThemedText style={[styles.statusText, { color: subtleTextColor }]}>
                    ARCHIVED
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View style={styles.roomMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={subtleTextColor} />
                <ThemedText style={[styles.metaText, { color: subtleTextColor }]} numberOfLines={1}>
                  {item.location}
                </ThemedText>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={subtleTextColor} />
                <ThemedText style={[styles.metaText, { color: subtleTextColor }]}>
                  Archived {archivedDate}
                </ThemedText>
              </View>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: successColor + '15', borderColor: successColor }]}
                onPress={handleRestore}
                activeOpacity={0.7}
              >
                <Ionicons name="refresh-outline" size={16} color={successColor} />
                <ThemedText style={[styles.actionButtonText, { color: successColor }]}>
                  Restore
                </ThemedText>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: errorColor + '15', borderColor: errorColor }]}
                onPress={handleDelete}
                activeOpacity={0.7}
              >
                <Ionicons name="trash-outline" size={16} color={errorColor} />
                <ThemedText style={[styles.actionButtonText, { color: errorColor }]}>
                  Delete
                </ThemedText>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

export default function ArchivedRoomsScreen() {
  const router = useRouter();
  const [archivedRooms, setArchivedRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filterAnimation] = useState(new Animated.Value(0));

  const defaultSortOption: SortOption = 'archivedDate';
  const defaultSortDirection: SortDirection = 'desc';
  const defaultSortLabel = 'Recently Archived';

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    option: defaultSortOption,
    direction: defaultSortDirection,
    label: defaultSortLabel,
    icon: 'time-outline',
  });

  // Theme colors
  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
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

  const fetchArchivedRooms = useCallback(async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    try {
      const rooms = await Rooms.RoomService.getArchivedRooms();
      setArchivedRooms(rooms);
      applyFilters(rooms, searchTerm);
    } catch (error) {
      console.error('Failed to fetch archived rooms:', error);
      Alert.alert('Error', 'Failed to load archived rooms.');
    } finally {
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm]);

  const applyFilters = (rooms: Room[], search: string) => {
    let filtered = [...rooms];
    
    // Apply search filter
    if (search.trim() !== '') {
      const lowerSearchTerm = search.toLowerCase();
      filtered = filtered.filter(room =>
        room.name.toLowerCase().includes(lowerSearchTerm) ||
        room.location.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    setFilteredRooms(filtered);
  };

  useEffect(() => {
    fetchArchivedRooms();
    const unsubscribe = Rooms.RoomService.onArchivedRoomsUpdate(
      (updatedRooms) => {
        setArchivedRooms(updatedRooms);
        applyFilters(updatedRooms, searchTerm);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      },
      (error) => {
        console.error("Error listening to archived room updates:", error);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      }
    );
    return () => unsubscribe();
  }, [fetchArchivedRooms]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchArchivedRooms(true);
  }, [fetchArchivedRooms]);

  useEffect(() => {
    applyFilters(archivedRooms, searchTerm);
  }, [searchTerm, archivedRooms]);

  const sortedRooms = useMemo(() => {
    let sorted = [...filteredRooms];
    
    sorted.sort((a, b) => {
      let comparison = 0;
      
      if (sortConfig.option === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortConfig.option === 'location') {
        comparison = a.location.localeCompare(b.location);
      } else if (sortConfig.option === 'archivedDate') {
        const dateA = a.archivedAt ? new Date(a.archivedAt as any).getTime() : 0;
        const dateB = b.archivedAt ? new Date(b.archivedAt as any).getTime() : 0;
        comparison = dateA - dateB;
      }
      
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [filteredRooms, sortConfig]);

  const sortOptions = [
    { option: 'archivedDate' as SortOption, label: 'Recently Archived', icon: 'time-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'name' as SortOption, label: 'Name', icon: 'text-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'location' as SortOption, label: 'Location', icon: 'location-outline' as keyof typeof Ionicons.glyphMap },
  ];

  const handleSortChange = (option: SortOption) => {
    const newDirection = sortConfig.option === option && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    const selectedOption = sortOptions.find(opt => opt.option === option);
    setSortConfig({
      option,
      direction: newDirection,
      label: selectedOption?.label || 'Recently Archived',
      icon: selectedOption?.icon || 'time-outline',
    });
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setSortConfig({
      option: defaultSortOption,
      direction: defaultSortDirection,
      label: defaultSortLabel,
      icon: 'time-outline',
    });
  };

  const hasActiveFilters = searchTerm.trim() !== '' || sortConfig.option !== defaultSortOption || sortConfig.direction !== defaultSortDirection;

  const handleRestoreRoom = (room: Room) => {
    Alert.alert(
      'Restore Room',
      `Are you sure you want to restore "${room.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'default',
          onPress: async () => {
            try {
              await Rooms.RoomService.restoreRoom(room.id);
              Alert.alert('Success', `Room "${room.name}" has been restored.`);
            } catch (error: any) {
              console.error('Failed to restore room:', error);
              Alert.alert('Error', error.message || 'Failed to restore room.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteRoom = (room: Room) => {
    Alert.alert(
      'Delete Room Permanently',
      `Are you sure you want to permanently delete "${room.name}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Permanently',
          style: 'destructive',
          onPress: async () => {
            try {
              await Rooms.RoomService.deleteRoom(room.id);
              Alert.alert('Success', `Room "${room.name}" has been permanently deleted.`);
            } catch (error: any) {
              console.error('Failed to delete room:', error);
              Alert.alert('Error', error.message || 'Failed to delete room.');
            }
          },
        },
      ]
    );
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Archived Rooms' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {/* Enhanced Header */}
        <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
          {/* Search Bar with Filter Toggle */}
          <View style={styles.searchRow}>
            <View style={[styles.searchContainer, {backgroundColor: searchInputBackgroundColor, borderColor: searchInputBorderColor}]}>
              <Ionicons name="search-outline" size={20} color={searchIconInputColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, {color: searchInputTextColor}]}
                placeholder="Search archived rooms..."
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

        {/* Content */}
        {sortedRooms.length === 0 ? (
          <View style={styles.centered}>
            <Ionicons 
              name={searchTerm.trim() === '' ? "archive-outline" : "search-outline"} 
              size={70} 
              color={emptyStateIconColor} 
            />
            <ThemedText style={[styles.emptyText, { color: textColor }]}>
              {searchTerm.trim() === '' 
                ? 'No archived rooms found.\nArchived rooms will appear here.' 
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
            renderItem={({ item }) => 
              <RoomItem 
                item={item} 
                onRestore={handleRestoreRoom}
                onDelete={handleDeleteRoom}
              />
            }
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
    </>
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
    paddingBottom: Layout.spacing.xl,
  },
  
  // Room Item Styles
  roomItemTouchable: {
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  roomCard: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  roomContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  roomIconContainer: {
    marginRight: Layout.spacing.md,
    alignItems: 'center',
    paddingTop: Layout.spacing.xs,
  },
  roomTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  roomHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  roomName: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    fontFamily: 'Montserrat-SemiBold',
    marginRight: Layout.spacing.sm,
    lineHeight: Layout.fontSize.md * 1.3,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  roomMeta: {
    gap: Layout.spacing.xs / 2,
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
  
  // Action Buttons
  actionButtonsContainer: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginTop: Layout.spacing.xs,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs + 2,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    flex: 1,
    justifyContent: 'center',
    minHeight: 36,
  },
  actionButtonText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.xs / 2,
  },
});