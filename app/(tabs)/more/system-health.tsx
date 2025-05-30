// app/(tabs)/more/system-health.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, RefreshControl, TouchableOpacity } from 'react-native';

interface SystemStatus {
  category: string;
  items: {
    name: string;
    status: 'online' | 'offline' | 'warning';
    lastSeen?: string;
    details?: string;
  }[];
}

export default function SystemHealthScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const successColor = useThemeColor({}, 'successText');
  const warningColor = useThemeColor({}, 'warningText');
  const errorColor = useThemeColor({}, 'errorText');

  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Mock system health data - replace with real API calls
  const [systemHealth, setSystemHealth] = useState<SystemStatus[]>([
    {
      category: 'Sensors',
      items: [
        { name: 'Temperature Sensors', status: 'online', details: '24/26 online' },
        { name: 'Humidity Sensors', status: 'online', details: '22/24 online' },
        { name: 'Gas Sensors', status: 'warning', details: '3/4 online', lastSeen: '2 minutes ago' },
        { name: 'Motion Detectors', status: 'online', details: '8/8 online' },
      ],
    },
    {
      category: 'Network',
      items: [
        { name: 'Main Gateway', status: 'online', details: 'Signal strength: Strong' },
        { name: 'WiFi Network', status: 'online', details: 'Latency: 12ms' },
        { name: 'Internet Connection', status: 'online', details: 'Stable connection' },
      ],
    },
    {
      category: 'Services',
      items: [
        { name: 'Alert System', status: 'online', details: 'All notifications working' },
        { name: 'Data Processing', status: 'online', details: 'Processing queue: 0' },
        { name: 'Backup System', status: 'online', details: 'Last backup: 1 hour ago' },
      ],
    },
  ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setLastUpdated(new Date());
      setRefreshing(false);
    }, 1000);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return successColor;
      case 'warning':
        return warningColor;
      case 'offline':
        return errorColor;
      default:
        return subtitleColor;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'offline':
        return 'close-circle';
      default:
        return 'help-circle';
    }
  };

  const getOverallHealthScore = () => {
    let totalItems = 0;
    let healthyItems = 0;

    systemHealth.forEach(category => {
      category.items.forEach(item => {
        totalItems++;
        if (item.status === 'online') healthyItems++;
      });
    });

    return Math.round((healthyItems / totalItems) * 100);
  };

  const healthScore = getOverallHealthScore();

  return (
    <>
      <Stack.Screen options={{ title: 'System Health' }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Overall Health Card */}
        <Card style={styles.healthScoreCard}>
          <ThemedView style={styles.healthScoreHeader}>
            <ThemedView style={[styles.healthScoreCircle, { 
              backgroundColor: healthScore >= 90 ? successColor + '15' : 
                              healthScore >= 70 ? warningColor + '15' : errorColor + '15'
            }]}>
              <ThemedText style={[styles.healthScoreText, { 
                color: healthScore >= 90 ? successColor : 
                       healthScore >= 70 ? warningColor : errorColor
              }]}>
                {healthScore}%
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.healthScoreInfo}>
              <ThemedText style={[styles.healthScoreTitle, { color: textColor }]}>
                System Health
              </ThemedText>
              <ThemedText style={[styles.healthScoreSubtitle, { color: subtitleColor }]}>
                Overall system performance
              </ThemedText>
              <ThemedText style={[styles.lastUpdated, { color: subtitleColor }]}>
                Last updated: {lastUpdated.toLocaleTimeString()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* System Categories */}
        {systemHealth.map((category, categoryIndex) => (
          <Card key={categoryIndex} style={styles.categoryCard}>
            <ThemedText style={[styles.categoryTitle, { color: textColor }]}>
              {category.category}
            </ThemedText>
            
            {category.items.map((item, itemIndex) => (
              <ThemedView 
                key={itemIndex} 
                style={[
                  styles.statusItem,
                  itemIndex < category.items.length - 1 && styles.statusItemBorder,
                  { borderBottomColor: useThemeColor({}, 'borderColor') }
                ]}
              >
                <ThemedView style={styles.statusLeft}>
                  <Ionicons 
                    name={getStatusIcon(item.status) as any} 
                    size={20} 
                    color={getStatusColor(item.status)} 
                  />
                  <ThemedView style={styles.statusInfo}>
                    <ThemedText style={[styles.statusName, { color: textColor }]}>
                      {item.name}
                    </ThemedText>
                    {item.details && (
                      <ThemedText style={[styles.statusDetails, { color: subtitleColor }]}>
                        {item.details}
                      </ThemedText>
                    )}
                  </ThemedView>
                </ThemedView>
                
                <ThemedView style={styles.statusRight}>
                  <ThemedText style={[styles.statusLabel, { 
                    color: getStatusColor(item.status),
                    textTransform: 'capitalize'
                  }]}>
                    {item.status}
                  </ThemedText>
                  {item.lastSeen && (
                    <ThemedText style={[styles.lastSeen, { color: subtitleColor }]}>
                      {item.lastSeen}
                    </ThemedText>
                  )}
                </ThemedView>
              </ThemedView>
            ))}
          </Card>
        ))}

        {/* Quick Actions */}
        <Card style={styles.actionsCard}>
          <ThemedText style={[styles.categoryTitle, { color: textColor }]}>
            Quick Actions
          </ThemedText>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="refresh" size={20} color={tintColor} />
            <ThemedText style={[styles.actionText, { color: tintColor }]}>
              Refresh All Systems
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="settings" size={20} color={tintColor} />
            <ThemedText style={[styles.actionText, { color: tintColor }]}>
              System Configuration
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="download" size={20} color={tintColor} />
            <ThemedText style={[styles.actionText, { color: tintColor }]}>
              Download Health Report
            </ThemedText>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  healthScoreCard: {
    marginBottom: Layout.spacing.lg,
  },
  healthScoreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  healthScoreCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  healthScoreText: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
  },
  healthScoreInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  healthScoreTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  healthScoreSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs,
  },
  lastUpdated: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
  },
  categoryCard: {
    marginBottom: Layout.spacing.lg,
  },
  categoryTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  statusItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: Layout.spacing.sm,
    paddingBottom: Layout.spacing.md,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusInfo: {
    marginLeft: Layout.spacing.sm,
    flex: 1,
    backgroundColor: 'transparent',
  },
  statusName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  statusDetails: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  statusRight: {
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
  },
  statusLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  lastSeen: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs / 2,
  },
  actionsCard: {
    marginBottom: Layout.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  actionText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
  },
});
