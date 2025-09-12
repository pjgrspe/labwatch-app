// labwatch-app/modules/cameras/components/PeopleCounter.tsx

import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { DetectedPerson, PeopleDetectionStats } from '@/types/peopleDetection';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface PeopleCounterProps {
  count: number;
  detectedPersons?: DetectedPerson[];
  isActive: boolean;
  isInitializing?: boolean;
  error?: string | null;
  stats?: PeopleDetectionStats;
  style?: any;
  compact?: boolean;
  showStats?: boolean;
  onToggleDetection?: () => void;
  onShowDetails?: () => void;
}

export default function PeopleCounter({
  count,
  detectedPersons = [],
  isActive,
  isInitializing = false,
  error = null,
  stats,
  style,
  compact = false,
  showStats = false,
  onToggleDetection,
  onShowDetails
}: PeopleCounterProps) {
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
  const cardBackground = useThemeColor({}, 'cardBackground');

  // Determine status color and text
  const getStatusInfo = () => {
    if (error) {
      return { color: errorColor, text: 'Error', icon: 'warning-outline' as const };
    }
    if (isInitializing) {
      return { color: tintColor, text: 'Loading...', icon: 'hourglass-outline' as const };
    }
    if (!isActive) {
      return { color: subtleTextColor, text: 'Inactive', icon: 'pause-outline' as const };
    }
    return { color: successColor, text: 'Active', icon: 'eye-outline' as const };
  };

  const statusInfo = getStatusInfo();

  // Get occupancy status based on count
  const getOccupancyStatus = () => {
    if (count === 0) return { text: 'Empty', color: subtleTextColor };
    if (count <= 2) return { text: 'Low', color: successColor };
    if (count <= 5) return { text: 'Moderate', color: tintColor };
    if (count <= 10) return { text: 'High', color: '#FF9500' }; // Orange
    return { text: 'Very High', color: errorColor };
  };

  const occupancyStatus = getOccupancyStatus();

  if (compact) {
    return (
      <ThemedView style={[styles.compactContainer, { backgroundColor: cardBackground }, style]}>
        <View style={styles.compactContent}>
          <View style={styles.countSection}>
            <Ionicons 
              name="people-outline" 
              size={20} 
              color={isActive ? tintColor : subtleTextColor} 
            />
            <ThemedText style={[styles.compactCount, { color: textColor }]}>
              {count}
            </ThemedText>
          </View>
          
          <View style={styles.statusSection}>
            <View style={[styles.statusDot, { backgroundColor: statusInfo.color }]} />
            <ThemedText style={[styles.compactStatus, { color: statusInfo.color }]}>
              {isActive && !error && !isInitializing ? 'LIVE' : statusInfo.text}
            </ThemedText>
          </View>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: cardBackground }, style]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleSection}>
          <Ionicons name="people" size={24} color={tintColor} />
          <ThemedText style={[styles.title, { color: textColor }]}>
            People Detection
          </ThemedText>
        </View>
        
        {onToggleDetection && (
          <TouchableOpacity 
            style={[styles.toggleButton, { backgroundColor: isActive ? successColor : subtleTextColor }]}
            onPress={onToggleDetection}
            disabled={isInitializing}
          >
            <Ionicons 
              name={isActive ? 'pause' : 'play'} 
              size={16} 
              color="#fff" 
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Main Count Display */}
      <View style={styles.countDisplay}>
        <View style={styles.mainCount}>
          <ThemedText style={[styles.countNumber, { color: textColor }]}>
            {count}
          </ThemedText>
          <ThemedText style={[styles.countLabel, { color: subtleTextColor }]}>
            {count === 1 ? 'Person' : 'People'}
          </ThemedText>
        </View>

        <View style={styles.occupancyInfo}>
          <ThemedText style={[styles.occupancyLabel, { color: subtleTextColor }]}>
            Occupancy:
          </ThemedText>
          <ThemedText style={[styles.occupancyStatus, { color: occupancyStatus.color }]}>
            {occupancyStatus.text}
          </ThemedText>
        </View>
      </View>

      {/* Status Bar */}
      <View style={styles.statusBar}>
        <View style={styles.statusItem}>
          <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
          <ThemedText style={[styles.statusText, { color: statusInfo.color }]}>
            {statusInfo.text}
          </ThemedText>
        </View>

        {isActive && !error && detectedPersons.length > 0 && (
          <View style={styles.statusItem}>
            <Ionicons name="checkmark-circle" size={16} color={successColor} />
            <ThemedText style={[styles.statusText, { color: successColor }]}>
              {detectedPersons.length} detected
            </ThemedText>
          </View>
        )}
      </View>

      {/* Error Message */}
      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={16} color={errorColor} />
          <ThemedText style={[styles.errorText, { color: errorColor }]}>
            {error}
          </ThemedText>
        </View>
      )}

      {/* Statistics (if enabled and available) */}
      {showStats && stats && isActive && (
        <View style={styles.statsContainer}>
          <ThemedText style={[styles.statsTitle, { color: textColor }]}>
            Statistics
          </ThemedText>
          
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {stats.averageCount.toFixed(1)}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
                Avg
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {stats.maxCount}
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
                Max
              </ThemedText>
            </View>
            
            <View style={styles.statItem}>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {(stats.detectionAccuracy * 100).toFixed(0)}%
              </ThemedText>
              <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
                Accuracy
              </ThemedText>
            </View>
          </View>
        </View>
      )}

      {/* Details Button */}
      {onShowDetails && (
        <TouchableOpacity style={styles.detailsButton} onPress={onShowDetails}>
          <ThemedText style={[styles.detailsButtonText, { color: tintColor }]}>
            View Details
          </ThemedText>
          <Ionicons name="chevron-forward" size={16} color={tintColor} />
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.lg,
    marginVertical: Layout.spacing.sm,
  },
  compactContainer: {
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.sm,
  },
  compactContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  countSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactCount: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.sm,
  },
  statusSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: Layout.spacing.xs,
  },
  compactStatus: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
    letterSpacing: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
  toggleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countDisplay: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  mainCount: {
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  countNumber: {
    fontSize: 48,
    fontFamily: 'Montserrat-Bold',
    lineHeight: 56,
  },
  countLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.xs,
  },
  occupancyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  occupancyLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  occupancyStatus: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: Layout.spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(128, 128, 128, 0.2)',
    marginBottom: Layout.spacing.md,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
  },
  errorText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  statsContainer: {
    marginBottom: Layout.spacing.md,
  },
  statsTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.xs,
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
  },
  detailsButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginRight: Layout.spacing.xs,
  },
});
