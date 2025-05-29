// modules/more/components/QuickStatsCard.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface QuickStat {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
}

interface QuickStatsCardProps {
  stats: QuickStat[];
}

const QuickStatsCard: React.FC<QuickStatsCardProps> = ({ stats }) => {
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');

  return (
    <Card style={styles.container}>
      <ThemedView style={styles.statsContainer}>
        {stats.map((stat, index) => (
          <TouchableOpacity
            key={stat.label}
            style={[
              styles.statItem,
              index < stats.length - 1 && {
                borderRightWidth: StyleSheet.hairlineWidth,
                borderRightColor: borderColor,
              },
            ]}
            onPress={stat.onPress}
            disabled={!stat.onPress}
            activeOpacity={stat.onPress ? 0.7 : 1}
          >
            <ThemedView style={[styles.iconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name={stat.icon} size={20} color={tintColor} />
            </ThemedView>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {stat.value}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtitleColor }]}>
              {stat.label}
            </ThemedText>
          </TouchableOpacity>
        ))}
      </ThemedView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.xs,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  statValue: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs / 2,
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});

export default QuickStatsCard;
