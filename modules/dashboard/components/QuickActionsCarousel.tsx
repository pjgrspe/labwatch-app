import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors } from '@/constants/Colors';
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  route?: string;
  backgroundColor?: string;
  onPress?: () => void;
  priority?: 'high' | 'medium' | 'low';
}

const QuickActionCard: React.FC<QuickAction & { themeColors: typeof Colors.light }> = ({
  label,
  iconName,
  backgroundColor,
  onPress,
  themeColors,
  priority = 'medium',
}) => {
  const defaultBgColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const textColor = useThemeColor({}, 'text');
  const iconColor = backgroundColor ? '#FFFFFF' : useThemeColor({}, 'tint');

  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return {
          borderWidth: 2,
          borderColor: themeColors.errorText,
          shadowColor: themeColors.errorText,
          shadowOpacity: 0.2,
        };
      case 'medium':
        return {
          borderWidth: 1,
          borderColor: borderColor,
        };
      case 'low':
        return {
          borderWidth: 1,
          borderColor: borderColor,
          opacity: 0.8,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickActionCard,
        { backgroundColor: backgroundColor || defaultBgColor },
        getPriorityStyles(),
      ]}
      activeOpacity={0.8}
    >
      <ThemedView style={[styles.iconContainer, { backgroundColor: backgroundColor ? 'rgba(255,255,255,0.2)' : themeColors.tint + '15' }]}>
        <Ionicons name={iconName} size={24} color={iconColor} />
      </ThemedView>
      <ThemedText style={[styles.quickActionLabel, { color: backgroundColor ? '#FFFFFF' : textColor }]}>
        {label}
      </ThemedText>
      {priority === 'high' && (
        <ThemedView style={[styles.priorityBadge, { backgroundColor: themeColors.errorText }]}>
          <Ionicons name="warning" size={12} color="#FFFFFF" />
        </ThemedView>
      )}
    </TouchableOpacity>
  );
};

const QuickActionsCarousel = () => {
  const router = useRouter();
  const currentTheme = useCurrentTheme();
  const themeColors = Colors[currentTheme];

  const quickActions: QuickAction[] = [
    { 
      label: "Report Incident", 
      iconName: "medkit-outline", 
      backgroundColor: themeColors.errorText, 
      priority: 'high',
      onPress: () => router.push('/(tabs)/more/incidents') 
    },
    { 
      label: "Safety Protocols", 
      iconName: "document-text-outline", 
      priority: 'medium',
      onPress: () => router.push('/(tabs)/more/protocols') 
    },
    { 
      label: "Settings", 
      iconName: "settings-outline", 
      priority: 'low',
      onPress: () => router.push('/(tabs)/more/settings') 
    },
    { 
      label: "Manage Users", 
      iconName: "shield-checkmark-outline", 
      priority: 'low',
      onPress: () => router.push('/(tabs)/more/admin/manage-users') 
    },
  ];

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Quick Actions" 
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        style={styles.scrollView}
      >
        {quickActions.map((action) => (
          <QuickActionCard key={action.label} {...action} themeColors={themeColors} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.sm,
  },
  scrollView: {
    marginHorizontal: -Layout.spacing.md,
  },
  scrollContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
  },
  quickActionCard: {
    width: 140,
    height: 120,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginRight: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Layout.cardShadow,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  quickActionLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    lineHeight: Layout.fontSize.sm * 1.3,
  },
  priorityBadge: {
    position: 'absolute',
    top: Layout.spacing.xs,
    right: Layout.spacing.xs,
    width: 20,
    height: 20,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuickActionsCarousel;