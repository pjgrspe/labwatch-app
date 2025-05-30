// labwatch-app/app/(tabs)/more/admin/audit-logs.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  ipAddress: string;
  userAgent?: string;
}

interface FilterOptions {
  severity: string;
  module: string;
  dateRange: string;
  user: string;
}

export default function AuditLogsScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const primaryColor = useThemeColor({}, 'tint');

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    severity: 'all',
    module: 'all',
    dateRange: 'all',
    user: 'all',
  });

  // Mock data for audit logs
  const mockAuditLogs: AuditLog[] = [
    {
      id: '1',
      timestamp: '2024-01-15T14:30:00Z',
      user: 'admin@labwatch.com',
      action: 'Updated system configuration',
      module: 'System Settings',
      details: 'Changed temperature alert threshold from 25°C to 23°C',
      severity: 'medium',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    },
    {
      id: '2',
      timestamp: '2024-01-15T13:45:00Z',
      user: 'researcher@university.edu',
      action: 'Created new user account',
      module: 'User Management',
      details: 'Added new researcher role for John Smith',
      severity: 'low',
      ipAddress: '192.168.1.101',
    },
    {
      id: '3',
      timestamp: '2024-01-15T12:15:00Z',
      user: 'system@labwatch.com',
      action: 'Critical alert triggered',
      module: 'Alert System',
      details: 'Temperature sensor offline in Lab Room A',
      severity: 'critical',
      ipAddress: '127.0.0.1',
    },
    {
      id: '4',
      timestamp: '2024-01-15T11:30:00Z',
      user: 'maintenance@lab.edu',
      action: 'Exported sensor data',
      module: 'Data Export',
      details: 'Exported 7 days of temperature and humidity data',
      severity: 'low',
      ipAddress: '192.168.1.102',
    },
    {
      id: '5',
      timestamp: '2024-01-15T10:20:00Z',
      user: 'admin@labwatch.com',
      action: 'Deleted user account',
      module: 'User Management',
      details: 'Removed inactive account for former researcher',
      severity: 'high',
      ipAddress: '192.168.1.100',
    },
  ];

  useEffect(() => {
    loadAuditLogs();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [auditLogs, filters, searchQuery]);

  const loadAuditLogs = async () => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      Alert.alert('Error', 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...auditLogs];

    // Apply search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.module.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.details.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    // Apply module filter
    if (filters.module !== 'all') {
      filtered = filtered.filter(log => log.module === filters.module);
    }

    // Apply date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          cutoffDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.timestamp) >= cutoffDate);
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilters({
      severity: 'all',
      module: 'all',
      dateRange: 'all',
      user: 'all',
    });
    setSearchQuery('');
  };

  const exportLogs = () => {
    Alert.alert(
      'Export Audit Logs',
      'Audit logs will be exported as CSV file',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Export',
          onPress: () => Alert.alert('Success', 'Audit logs exported successfully'),
        },
      ]
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFAA00';
      case 'low': return '#00AA00';
      default: return secondaryTextColor;
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  const renderAuditLogItem = (log: AuditLog) => (
    <TouchableOpacity
      key={log.id}
      style={[styles.logItem, { backgroundColor: cardBackgroundColor, borderColor }]}
      onPress={() => {
        Alert.alert(
          'Audit Log Details',
          `Timestamp: ${formatTimestamp(log.timestamp)}\n` +
          `User: ${log.user}\n` +
          `Action: ${log.action}\n` +
          `Module: ${log.module}\n` +
          `Details: ${log.details}\n` +
          `IP Address: ${log.ipAddress}\n` +
          `Severity: ${log.severity.charAt(0).toUpperCase() + log.severity.slice(1)}`
        );
      }}
    >
      <View style={styles.logHeader}>
        <View style={styles.logTitleRow}>
          <Ionicons
            name={getSeverityIcon(log.severity)}
            size={20}
            color={getSeverityColor(log.severity)}
          />
          <Text style={[styles.logAction, { color: textColor }]} numberOfLines={1}>
            {log.action}
          </Text>
          <Text style={[styles.logTimestamp, { color: secondaryTextColor }]}>
            {formatTimestamp(log.timestamp)}
          </Text>
        </View>
        <View style={styles.logMetadata}>
          <Text style={[styles.logUser, { color: primaryColor }]} numberOfLines={1}>
            {log.user}
          </Text>
          <Text style={[styles.logModule, { color: secondaryTextColor }]}>
            {log.module}
          </Text>
        </View>
      </View>
      <Text style={[styles.logDetails, { color: secondaryTextColor }]} numberOfLines={2}>
        {log.details}
      </Text>
    </TouchableOpacity>
  );

  const renderFilterSection = () => (
    <View style={[styles.filterSection, { backgroundColor: cardBackgroundColor, borderColor }]}>
      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Severity:</Text>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor }]}
          onPress={() => {
            Alert.alert(
              'Filter by Severity',
              '',
              [
                { text: 'All', onPress: () => setFilters(prev => ({ ...prev, severity: 'all' })) },
                { text: 'Critical', onPress: () => setFilters(prev => ({ ...prev, severity: 'critical' })) },
                { text: 'High', onPress: () => setFilters(prev => ({ ...prev, severity: 'high' })) },
                { text: 'Medium', onPress: () => setFilters(prev => ({ ...prev, severity: 'medium' })) },
                { text: 'Low', onPress: () => setFilters(prev => ({ ...prev, severity: 'low' })) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Text style={[styles.filterButtonText, { color: textColor }]}>
            {filters.severity === 'all' ? 'All' : filters.severity.charAt(0).toUpperCase() + filters.severity.slice(1)}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterRow}>
        <Text style={[styles.filterLabel, { color: textColor }]}>Date Range:</Text>
        <TouchableOpacity
          style={[styles.filterButton, { borderColor }]}
          onPress={() => {
            Alert.alert(
              'Filter by Date Range',
              '',
              [
                { text: 'All Time', onPress: () => setFilters(prev => ({ ...prev, dateRange: 'all' })) },
                { text: 'Today', onPress: () => setFilters(prev => ({ ...prev, dateRange: 'today' })) },
                { text: 'Last Week', onPress: () => setFilters(prev => ({ ...prev, dateRange: 'week' })) },
                { text: 'Last Month', onPress: () => setFilters(prev => ({ ...prev, dateRange: 'month' })) },
                { text: 'Cancel', style: 'cancel' },
              ]
            );
          }}
        >
          <Text style={[styles.filterButtonText, { color: textColor }]}>
            {filters.dateRange === 'all' ? 'All Time' :
             filters.dateRange === 'today' ? 'Today' :
             filters.dateRange === 'week' ? 'Last Week' :
             filters.dateRange === 'month' ? 'Last Month' : filters.dateRange}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.clearFiltersButton, { backgroundColor: primaryColor }]}
        onPress={clearFilters}
      >
        <Text style={styles.clearFiltersText}>Clear Filters</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor }]}>
      {/* Header Actions */}
      <View style={[styles.headerActions, { backgroundColor: cardBackgroundColor, borderColor }]}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={secondaryTextColor} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: textColor }]}
            placeholder="Search audit logs..."
            placeholderTextColor={secondaryTextColor}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor }]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <Ionicons
            name={showFilters ? "filter" : "filter-outline"}
            size={20}
            color={primaryColor}
          />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { borderColor }]}
          onPress={exportLogs}
        >
          <Ionicons name="download-outline" size={20} color={primaryColor} />
        </TouchableOpacity>
      </View>

      {/* Filter Section */}
      {showFilters && renderFilterSection()}

      {/* Results Summary */}
      <View style={styles.summaryContainer}>
        <Text style={[styles.summaryText, { color: secondaryTextColor }]}>
          Showing {filteredLogs.length} of {auditLogs.length} logs
        </Text>
      </View>

      {/* Audit Logs List */}
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={loadAuditLogs} />
        }
      >
        {filteredLogs.length > 0 ? (
          filteredLogs.map(renderAuditLogItem)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-outline" size={64} color={secondaryTextColor} />
            <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
              {auditLogs.length === 0 ? 'No audit logs available' : 'No logs match the current filters'}
            </Text>
            {auditLogs.length > 0 && (
              <TouchableOpacity
                style={[styles.clearFiltersButton, { backgroundColor: primaryColor, marginTop: Layout.spacing.md }]}
                onPress={clearFilters}
              >
                <Text style={styles.clearFiltersText}>Clear Filters</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    gap: Layout.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: Layout.spacing.xs,
  },  searchInput: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.normal,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterSection: {
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    gap: Layout.spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },  filterLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
    flex: 1,
  },
  filterButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    minWidth: 80,
    alignItems: 'center',
  },
  filterButtonText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  clearFiltersButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  clearFiltersText: {
    color: 'white',
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
  summaryContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  summaryText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.normal,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Layout.spacing.md,
    paddingTop: 0,
  },
  logItem: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
    marginBottom: Layout.spacing.sm,
  },
  logHeader: {
    marginBottom: Layout.spacing.sm,
  },
  logTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },  logAction: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  logTimestamp: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.normal,
  },
  logMetadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logUser: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    flex: 1,
  },
  logModule: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.normal,
  },
  logDetails: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.normal,
    lineHeight: 16,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },  emptyStateText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.normal,
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});
