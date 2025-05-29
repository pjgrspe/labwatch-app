// labwatch-app/modules/dashboard/components/QuickActionsCarousel.tsx
import SectionHeader from '@/components/SectionHeader';
import { Text as ThemedText } from '@/components/Themed';
import { Colors } from '@/constants/Colors'; //
import Layout from '@/constants/Layout'; //
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; //
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap;
  route?: string; // For Expo Router navigation
  backgroundColor?: string; // Optional custom background
  onPress?: () => void; // For custom actions
}

const QuickActionCard: React.FC<QuickAction & { themeColors: typeof Colors.light }> = ({
  label,
  iconName,
  backgroundColor,
  onPress,
  themeColors,
}) => {
  const defaultBgColor = useThemeColor({}, 'cardBackground');
  const contentColor = useThemeColor({}, backgroundColor ? 'text' : 'tint');

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickActionCard,
        { backgroundColor: backgroundColor || defaultBgColor }
      ]}
    >
      <Ionicons name={iconName} size={28} color={contentColor} />
      <ThemedText style={[styles.quickActionLabel, { color: contentColor }]}>
        {label}
      </ThemedText>
    </TouchableOpacity>
  );
};

const QuickActionsCarousel = () => {
  const router = useRouter();
  const currentTheme = useCurrentTheme(); // [from previous turn]
  const themeColors = Colors[currentTheme]; // [from previous turn]

  const quickActions: QuickAction[] = [
    { label: "Report Incident", iconName: "medkit-outline", backgroundColor: themeColors.tint, onPress: () => router.push('/(tabs)/more/incidents') }, //
    { label: "Safety Protocols", iconName: "document-text-outline", onPress: () => router.push('/(tabs)/more/protocols') }, //
    // { label: "Knowledge Base", iconName: "book-outline", onPress: () => router.push('/(tabs)/more/knowledge-base') }, //
    { label: "Manage Users", iconName: "shield-checkmark-outline", onPress: () => router.push('/(tabs)/more/admin/manage-users') }, //
  ];


  return (
    <View>
      <SectionHeader title="Quick Actions" />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickActionsScroll}
      >
        {quickActions.map((action) => (
          <QuickActionCard key={action.label} {...action} themeColors={themeColors}/>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  quickActionsScroll: { //
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
  },
  quickActionCard: { //
    width: 130,
    height: 110,
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.md,
    marginRight: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...Layout.cardShadow, //
  },
  quickActionLabel: { //
    marginTop: Layout.spacing.sm,
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
    textAlign: 'center',
  },
});

export default QuickActionsCarousel;