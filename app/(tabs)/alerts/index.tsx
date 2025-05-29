// Modified app/(tabs)/alerts/index.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { ColorName, Colors, Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { Alert as AlertInterface, AlertSeverity, AlertType as AlertTypeStrings } from '@/types/alerts';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Platform,
  RefreshControl,
  ScrollView,
  SectionList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// --- Helper Types ---
type SortOption = 'date' | 'severity' | 'roomName';
type SortDirection = 'asc' | 'desc';
type FilterStatus = 'all' | 'active' | 'acknowledged';

interface GroupedAlerts {
  title: string;
  data: AlertInterface[];
}

interface SortConfig {
  option: SortOption;
  direction: SortDirection;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

// --- Constants for UI ---
const severityOrder: AlertSeverity[] = ['critical', 'high', 'medium', 'low', 'info'];

const severityThemeColors: { [key in AlertSeverity]: ColorName } = {
  critical: 'errorText',
  high: 'warningText',
  medium: 'infoText',
  low: 'successText',
  info: 'icon',
};

const getIconForAlertType = (type: AlertTypeStrings): keyof typeof Ionicons.glyphMap => {
  switch (type) {
    case 'high_temperature':
    case 'low_temperature':
    case 'thermal_anomaly':
      return 'thermometer-outline';
    case 'high_humidity':
    case 'low_humidity':
      return 'water-outline';
    case 'poor_air_quality_pm25':
    case 'poor_air_quality_pm10':
      return 'cloud-outline';
    case 'high_vibration':
      return 'pulse-outline';
    case 'equipment_offline':
      return 'power-outline';
    case 'equipment_malfunction':
      return 'build-outline';
    case 'connection_lost':
      return 'cloud-offline-outline';
    case 'maintenance_due':
      return 'construct-outline';
    case 'test_alert':
      return 'bug-outline';
    default:
      return 'alert-circle-outline';
  }
};

// --- Date Formatting Helper ---
const formatDateGroupTitle = (date: Date): string => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }
  return date.toLocaleDateString([], {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// --- Filter Chip Component ---
const FilterChip: React.FC<{
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress: () => void;
  showBadge?: boolean;
  badgeCount?: number;
  showSortDirection?: boolean;
  sortDirection?: SortDirection;
}> = React.memo(({ label, icon, isActive, onPress, showBadge, badgeCount, showSortDirection, sortDirection }) => {
  // Call hooks at the top level
  const activeColor = useThemeColor({}, 'tint');
  const inactiveColor = useThemeColor({}, 'icon');
  const activeBackgroundColor = useThemeColor({light: Colors.light.tint + '15', dark: Colors.dark.tint + '20'}, 'background');
  const inactiveBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary}, 'surfaceSecondary');
  const borderColor = useThemeColor({}, 'borderColor');

  // Now memoize the colors object
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
      {showBadge && badgeCount !== undefined && badgeCount > 0 && (
        <View style={[styles.chipBadge, { backgroundColor: colors.activeColor }]}>
          <ThemedText style={styles.chipBadgeText}>
            {badgeCount > 99 ? '99+' : badgeCount.toString()}
          </ThemedText>
        </View>
      )}
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.label === nextProps.label &&
    prevProps.icon === nextProps.icon &&
    prevProps.isActive === nextProps.isActive &&
    prevProps.showBadge === nextProps.showBadge &&
    prevProps.badgeCount === nextProps.badgeCount &&
    prevProps.showSortDirection === nextProps.showSortDirection &&
    prevProps.sortDirection === nextProps.sortDirection
  );
});

// --- Enhanced Alert Item Component - Optimized ---
const AlertItem: React.FC<{ 
  item: AlertInterface; 
  isLastItemInSection?: boolean; 
  sortConfig: SortConfig;
}> = React.memo(({ item, isLastItemInSection, sortConfig }) => {
  const router = useRouter();
  
  // Call hooks at the top level
  const itemSeverityColor = useThemeColor({}, severityThemeColors[item.severity] || 'text');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const titleColor = useThemeColor({}, 'text');
  const detailColor = useThemeColor({}, 'icon');
  const acknowledgedColor = useThemeColor({}, 'successText');
  const borderColor = useThemeColor({}, 'borderColor');

  // Memoize color calculations
  const colors = useMemo(() => ({
    itemSeverityColor,
    cardBackgroundColor,
    titleColor,
    detailColor,
    acknowledgedColor,
    borderColor,
  }), [itemSeverityColor, cardBackgroundColor, titleColor, detailColor, acknowledgedColor, borderColor]);

  // Memoize date calculations
  const dateInfo = useMemo(() => {
    const timestamp = item.timestamp instanceof Date
      ? item.timestamp
      : (item.timestamp && 'seconds' in item.timestamp)
        ? new Date((item.timestamp as any).seconds * 1000)
        : new Date();

    const acknowledgedAt = item.acknowledgedAt instanceof Date
      ? item.acknowledgedAt
      : (item.acknowledgedAt && 'seconds' in item.acknowledgedAt)
        ? new Date((item.acknowledgedAt as any).seconds * 1000)
        : null;

    return {
      timeString: timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateString: timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' }),
      acknowledgedAtString: acknowledgedAt
        ? ` @ ${acknowledgedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
        : '',
    };
  }, [item.timestamp, item.acknowledgedAt]);

  // Memoize icon
  const alertIcon = useMemo(() => getIconForAlertType(item.type), [item.type]);

  // Memoize press handler
  const handlePress = useCallback(() => {
    router.push(`/(tabs)/alerts/${item.id}` as any);
  }, [item.id, router]);

  return (
    <TouchableOpacity 
      onPress={handlePress}
      style={styles.alertItemTouchable}
      activeOpacity={0.8}
    >
      <Card style={[
        styles.alertCard,
        { 
          backgroundColor: colors.cardBackgroundColor,
          borderColor: item.acknowledged ? colors.borderColor : colors.itemSeverityColor,
          borderWidth: item.acknowledged ? 1 : 2,
          opacity: item.acknowledged ? 0.7 : 1,
        },
        isLastItemInSection ? styles.lastItemInSection : {}
      ]}>
        <View style={styles.alertContent}>
          <View style={styles.alertIconContainer}>
            <Ionicons 
              name={alertIcon} 
              size={32} 
              color={item.acknowledged ? colors.acknowledgedColor : colors.itemSeverityColor}
            />
            {!item.acknowledged && (
              <View style={[styles.severityBadge, { backgroundColor: colors.itemSeverityColor }]}>
                <ThemedText style={styles.severityBadgeText}>
                  {item.severity === 'critical' ? '!' : item.severity.charAt(0).toUpperCase()}
                </ThemedText>
              </View>
            )}
          </View>
          
          <View style={styles.alertTextContainer}>
            <View style={styles.alertHeader}>
              <ThemedText style={[styles.alertMessage, { color: colors.titleColor }]} numberOfLines={2}>
                {item.message.split(':')[0] || item.type.replace(/_/g, ' ')}
              </ThemedText>
              <View style={styles.statusContainer}>
                {item.acknowledged ? (
                  <View style={[styles.statusBadge, { backgroundColor: colors.acknowledgedColor + '20' }]}>
                    <Ionicons name="checkmark-circle" size={14} color={colors.acknowledgedColor} />
                    <ThemedText style={[styles.statusText, { color: colors.acknowledgedColor }]}>
                      ACK
                    </ThemedText>
                  </View>
                ) : (
                  <View style={[styles.statusBadge, { backgroundColor: colors.itemSeverityColor + '20' }]}>
                    <ThemedText style={[styles.statusText, { color: colors.itemSeverityColor }]}>
                      {item.severity.toUpperCase()}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
            
            <View style={styles.alertMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={colors.detailColor} />
                <ThemedText style={[styles.metaText, { color: colors.detailColor }]} numberOfLines={1}>
                  {item.roomName}
                  {item.sensorId && ` • ${item.sensorId.substring(item.sensorId.lastIndexOf('-') + 1)}`}
                </ThemedText>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="time-outline" size={14} color={colors.detailColor} />
                <ThemedText style={[styles.metaText, { color: colors.detailColor }]}>
                  {sortConfig.option === 'date' ? dateInfo.timeString : `${dateInfo.dateString}, ${dateInfo.timeString}`}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
        
        {item.acknowledged && item.acknowledgedByName && (
          <View style={styles.acknowledgedInfo}>
            <ThemedText style={[styles.acknowledgedByText, { color: colors.detailColor }]}>
              Acknowledged by {item.acknowledgedByName}{dateInfo.acknowledgedAtString}
            </ThemedText>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo
  return (
    prevProps.item.id === nextProps.item.id &&
    prevProps.item.acknowledged === nextProps.item.acknowledged &&
    prevProps.item.severity === nextProps.item.severity &&
    prevProps.item.message === nextProps.item.message &&
    prevProps.item.roomName === nextProps.item.roomName &&
    prevProps.isLastItemInSection === nextProps.isLastItemInSection &&
    prevProps.sortConfig.option === nextProps.sortConfig.option &&
    prevProps.sortConfig.direction === nextProps.sortConfig.direction
  );
});

// --- Main Screen Component ---
export default function AlertsListScreen() {
  const [allAlerts, setAllAlerts] = useState<AlertInterface[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<AlertInterface[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all');
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [filterAnimation] = useState(new Animated.Value(0));

  const defaultSortOption: SortOption = 'date';
  const defaultSortDirection: SortDirection = 'desc';
  const defaultSortLabel = 'Recent';
  const defaultSortIcon: keyof typeof Ionicons.glyphMap = 'time-outline';

  const [sortConfig, setSortConfig] = useState<SortConfig>({
    option: defaultSortOption,
    direction: defaultSortDirection,
    label: defaultSortLabel,
    icon: defaultSortIcon,
  });

  // Theme colors
  const containerBackgroundColor = useThemeColor({}, 'background');
  const activityIndicatorColor = useThemeColor({}, 'tint');
  const emptyStateTextColor = useThemeColor({}, 'text');
  const emptyStateIconColor = useThemeColor({}, 'successText');
  const sectionHeaderTextColor = useThemeColor({}, 'text');
  const searchInputBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary }, 'inputBackground');
  const searchInputTextColor = useThemeColor({}, 'text');
  const searchInputBorderColor = useThemeColor({}, 'borderColor');
  const searchIconInputColor = useThemeColor({}, 'icon');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const headerBackgroundColor = useThemeColor({}, 'cardBackground');
  const filterButtonBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary}, 'surfaceSecondary');

  // Alert counts for badges
  const alertCounts = useMemo(() => {
    const active = allAlerts.filter(alert => !alert.acknowledged).length;
    const acknowledged = allAlerts.filter(alert => alert.acknowledged).length;
    const critical = allAlerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged).length;
    const high = allAlerts.filter(alert => alert.severity === 'high' && !alert.acknowledged).length;
    
    return { active, acknowledged, critical, high, total: allAlerts.length };
  }, [allAlerts]);

  // Check if any filters are applied
  const hasActiveFilters = filterStatus !== 'all' || sortConfig.option !== defaultSortOption || sortConfig.direction !== defaultSortDirection;

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

  const fetchAlerts = async (isRefresh = false) => {
    if (!isRefresh) setIsLoading(true);
    else setRefreshing(true);
    try {
      const fetchedAlerts = await AlertService.getAlerts();
      setAllAlerts(fetchedAlerts);
      applyFilters(fetchedAlerts, searchTerm, filterStatus);
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
    } finally {
      if (!isRefresh) setIsLoading(false);
      setRefreshing(false);
    }
  };

  const applyFilters = (alerts: AlertInterface[], search: string, status: FilterStatus) => {
    let filtered = [...alerts];
    
    // Apply status filter
    if (status === 'active') {
      filtered = filtered.filter(alert => !alert.acknowledged);
    } else if (status === 'acknowledged') {
      filtered = filtered.filter(alert => alert.acknowledged);
    }
    
    // Apply search filter
    if (search.trim() !== '') {
      const lowerSearchTerm = search.toLowerCase();
      filtered = filtered.filter(alert =>
        alert.message.toLowerCase().includes(lowerSearchTerm) ||
        alert.type.toLowerCase().includes(lowerSearchTerm) ||
        alert.roomName.toLowerCase().includes(lowerSearchTerm) ||
        alert.severity.toLowerCase().includes(lowerSearchTerm) ||
        (alert.sensorId && alert.sensorId.toLowerCase().includes(lowerSearchTerm)) ||
        (alert.acknowledgedByName && alert.acknowledgedByName.toLowerCase().includes(lowerSearchTerm))
      );
    }
    
    setFilteredAlerts(filtered);
  };

  useEffect(() => {
    const unsubscribe = AlertService.onAlertsUpdate(
      (updatedAlerts) => {
        setAllAlerts(updatedAlerts);
        applyFilters(updatedAlerts, searchTerm, filterStatus);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      },
      (error) => {
        console.error("Error listening to alert updates:", error);
        if (isLoading) setIsLoading(false);
        if (refreshing) setRefreshing(false);
      }
    );
    return () => unsubscribe();
  }, [isLoading, refreshing, searchTerm, filterStatus]);

  const onRefresh = useCallback(() => {
    fetchAlerts(true);
  }, []);

  useEffect(() => {
    applyFilters(allAlerts, searchTerm, filterStatus);
  }, [searchTerm, filterStatus, allAlerts]);

  const sortedAndGroupedAlerts = useMemo(() => {
    let sorted = [...filteredAlerts];

    sorted.sort((a, b) => {
      let comparison = 0;
      const dateA = a.timestamp instanceof Date ? a.timestamp.getTime() : (a.timestamp as any).seconds * 1000;
      const dateB = b.timestamp instanceof Date ? b.timestamp.getTime() : (b.timestamp as any).seconds * 1000;

      if (sortConfig.option === 'date') {
        comparison = dateA - dateB;
      } else if (sortConfig.option === 'severity') {
        comparison = severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity);
        if (comparison === 0) comparison = dateB - dateA;
      } else if (sortConfig.option === 'roomName') {
        comparison = a.roomName.localeCompare(b.roomName);
        if (comparison === 0) comparison = dateB - dateA;
      }
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    });

    // Always show unacknowledged alerts first
    sorted.sort((a, b) => {
      if (a.acknowledged && !b.acknowledged) return 1;
      if (!a.acknowledged && b.acknowledged) return -1;
      return 0;
    });

    const groups: { [key: string]: AlertInterface[] } = {};
    if (sortConfig.option === 'date') {
      sorted.forEach(alert => {
        const alertDate = alert.timestamp instanceof Date ? alert.timestamp : new Date((alert.timestamp as any).seconds * 1000);
        const dayKey = alertDate.toDateString();
        if (!groups[dayKey]) groups[dayKey] = [];
        groups[dayKey].push(alert);
      });
      return Object.keys(groups)
        .sort((a, b) => sortConfig.direction === 'asc' ? new Date(a).getTime() - new Date(b).getTime() : new Date(b).getTime() - new Date(a).getTime())
        .map(dayKey => ({ title: formatDateGroupTitle(new Date(dayKey)), data: groups[dayKey] }));
    } else if (sortConfig.option === 'roomName' || sortConfig.option === 'severity') {
      sorted.forEach(alert => {
        const key = sortConfig.option === 'roomName' ? alert.roomName : alert.severity;
        if (!groups[key]) groups[key] = [];
        groups[key].push(alert);
      });
      let groupSortOrder: string[];
      if (sortConfig.option === 'severity') {
        groupSortOrder = [...severityOrder];
        if(sortConfig.direction === 'desc') groupSortOrder.reverse();
      } else {
        groupSortOrder = Object.keys(groups).sort((a,b) => sortConfig.direction === 'asc' ? a.localeCompare(b) : b.localeCompare(a));
      }
      return groupSortOrder
        .filter(key => groups[key] && groups[key].length > 0)
        .map(key => ({ title: `${sortConfig.option === 'severity' ? key.charAt(0).toUpperCase() + key.slice(1) : key}`, data: groups[key] }));
    }
    return [{ title: 'All Alerts', data: sorted }];
  }, [filteredAlerts, sortConfig]);

  const sortOptions = [
    { option: 'date' as SortOption, label: 'Recent', icon: 'time-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'severity' as SortOption, label: 'Priority', icon: 'layers-outline' as keyof typeof Ionicons.glyphMap },
    { option: 'roomName' as SortOption, label: 'Location', icon: 'location-outline' as keyof typeof Ionicons.glyphMap },
  ];

  const handleSortChange = (option: SortOption) => {
    const newDirection = sortConfig.option === option && sortConfig.direction === 'desc' ? 'asc' : 'desc';
    const selectedOption = sortOptions.find(opt => opt.option === option);
    setSortConfig({
      option,
      direction: newDirection,
      label: selectedOption?.label || 'Recent',
      icon: selectedOption?.icon || 'time-outline',
    });
  };

  const clearAllFilters = () => {
    setFilterStatus('all');
    setSearchTerm('');
    setSortConfig({
      option: defaultSortOption,
      direction: defaultSortDirection,
      label: defaultSortLabel,
      icon: defaultSortIcon,
    });
  };

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Alerts' }} />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {/* Enhanced Header */}
        <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
          {/* Search Bar with Filter Toggle */}
          <View style={styles.searchRow}>
            <View style={[styles.searchContainer, {backgroundColor: searchInputBackgroundColor, borderColor: searchInputBorderColor}]}>
              <Ionicons name="search-outline" size={20} color={searchIconInputColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, {color: searchInputTextColor}]}
                placeholder="Search alerts..."
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
                  backgroundColor: isFiltersExpanded ? activityIndicatorColor : filterButtonBackgroundColor,
                  borderColor: isFiltersExpanded ? activityIndicatorColor : searchInputBorderColor,
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
                <View style={[styles.filterBadge, { backgroundColor: activityIndicatorColor }]} />
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
                  outputRange: [0, 120], // Adjust based on content
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
            {/* Status Filters */}
            <View style={styles.filterSection}>
              <ThemedText style={[styles.filterSectionTitle, { color: searchIconInputColor }]}>
                Status
              </ThemedText>
              <ScrollView 
                horizontal 
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                <FilterChip
                  label="All"
                  icon="list-outline"
                  isActive={filterStatus === 'all'}
                  onPress={() => setFilterStatus('all')}
                  showBadge
                  badgeCount={alertCounts.total}
                />
                <FilterChip
                  label="Active"
                  icon="alert-circle-outline"
                  isActive={filterStatus === 'active'}
                  onPress={() => setFilterStatus('active')}
                  showBadge
                  badgeCount={alertCounts.active}
                />
                <FilterChip
                  label="Resolved"
                  icon="checkmark-circle-outline"
                  isActive={filterStatus === 'acknowledged'}
                  onPress={() => setFilterStatus('acknowledged')}
                  showBadge
                  badgeCount={alertCounts.acknowledged}
                />
              </ScrollView>
            </View>

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
        {sortedAndGroupedAlerts.length === 0 || (sortedAndGroupedAlerts.length === 1 && sortedAndGroupedAlerts[0].data.length === 0) ? (
          <View style={styles.centered}>
            <Ionicons 
              name={filterStatus === 'active' ? "shield-checkmark-outline" : searchTerm.trim() === '' ? "checkmark-done-circle-outline" : "search-outline"} 
              size={70} 
              color={emptyStateIconColor} 
            />
            <ThemedText style={[styles.emptyText, { color: emptyStateTextColor }]}>
              {filterStatus === 'active' && searchTerm.trim() === '' 
                ? 'No active alerts! All systems running smoothly.' 
                : searchTerm.trim() === '' 
                  ? 'All clear! No alerts to display.' 
                  : 'No alerts match your search.'}
            </ThemedText>
            {hasActiveFilters && (
              <TouchableOpacity
                style={styles.resetButton}
                onPress={clearAllFilters}
              >
                <ThemedText style={[styles.resetButtonText, { color: activityIndicatorColor }]}>
                  Clear Filters
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <SectionList
              sections={sortedAndGroupedAlerts}
              keyExtractor={(item, index) => item.id} // Remove index from key
              renderItem={({ item, section, index }) => 
                <AlertItem 
                  item={item} 
                  isLastItemInSection={index === section.data.length - 1} 
                  sortConfig={sortConfig} 
                />
              }
              // Add these performance optimizations
              removeClippedSubviews={true}
              maxToRenderPerBatch={10}
              updateCellsBatchingPeriod={50}
              initialNumToRender={10}
              windowSize={10}
              getItemLayout={undefined}
              renderSectionHeader={({ section: { title, data } }) =>
              (data.length > 0) ? (
                <View style={[styles.sectionHeaderContainer, { backgroundColor: containerBackgroundColor }]}>
                  <ThemedText style={[styles.sectionHeader, { color: sectionHeaderTextColor }]}>
                    {title}
                  </ThemedText>
                  <ThemedText style={[styles.sectionCount, { color: sectionHeaderTextColor }]}>
                    {data.length} alert{data.length !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              ) : null
            }
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={activityIndicatorColor} />
            }
            stickySectionHeadersEnabled={true}
            keyboardDismissMode="on-drag"
            keyboardShouldPersistTaps="handled"
          />
        )}
      </ThemedView>
    </>
  );
}

// ...existing code...

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
  
  // Filter Chips - Made slightly smaller
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm, // Reduced from md
    paddingVertical: Layout.spacing.xs, // Reduced from sm
    borderRadius: Layout.borderRadius.pill,
    marginRight: Layout.spacing.xs,
    minHeight: 32, // Reduced from 36
  },
  chipIcon: {
    marginRight: Layout.spacing.xs / 2,
  },
  sortIcon: {
    marginLeft: Layout.spacing.xs / 2,
  },
  chipText: {
    fontSize: Layout.fontSize.xs, // Reduced from sm
    fontFamily: 'Montserrat-Medium',
  },
  chipBadge: {
    marginLeft: Layout.spacing.xs / 2,
    paddingHorizontal: Layout.spacing.xs / 2,
    paddingVertical: 1,
    borderRadius: Layout.borderRadius.pill,
    minWidth: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipBadgeText: {
    fontSize: Layout.fontSize.xs - 2,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  clearFiltersButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 32, // Reduced from 36
    height: 32, // Reduced from 36
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
    marginRight: Layout.spacing.xs,
  },
  
  // Section Headers
  sectionHeaderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderColor,
  },
  sectionHeader: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.bold,
    fontFamily: 'Montserrat-Bold',
  },
  sectionCount: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    opacity: 0.7,
  },
  
  // List Content
  listContent: {
    paddingTop: Layout.spacing.xs,
    paddingBottom: Layout.spacing.xl,
  },
  
  // Alert Item Styles
  alertItemTouchable: {
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  alertCard: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    position: 'relative',
  },
  // priorityIndicator: {
  //   position: 'absolute',
  //   left: 0,
  //   top: 0,
  //   bottom: 0,
  //   width: 4,
  //   borderTopLeftRadius: Layout.borderRadius.lg,
  //   borderBottomLeftRadius: Layout.borderRadius.lg,
  // },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  alertIconContainer: {
    position: 'relative',
    marginRight: Layout.spacing.md,
    alignItems: 'center',
  },
  severityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  severityBadgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  alertTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  alertMessage: {
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
  alertMeta: {
    gap: Layout.spacing.xs / 2,
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
  acknowledgedInfo: {
    marginTop: Layout.spacing.sm,
    paddingTop: Layout.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.light.borderColor,
  },
  acknowledgedByText: {
    fontSize: Layout.fontSize.xs,
    fontStyle: 'italic',
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
  },
  lastItemInSection: {}
});