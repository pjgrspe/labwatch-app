// labwatch-app/modules/dashboard/components/DashboardHeader.tsx
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { Colors, ColorScheme } from '@/constants/Colors'; //
import Layout from '@/constants/Layout'; //
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet } from 'react-native';

interface DashboardHeaderProps {
  currentTheme: ColorScheme;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ currentTheme }) => {
  const themeColors = Colors[currentTheme];

  return (
    <LinearGradient
      colors={currentTheme === 'light' ? [themeColors.gradientStart, themeColors.gradientEnd] : [themeColors.headerBackground, themeColors.surfaceSecondary]} //
      style={styles.customHeaderGradient}
    >
      <ThemedView style={styles.customHeaderContent}>
        <ThemedText style={styles.headerGreeting}>Hello, Lab User!</ThemedText>
        <ThemedText style={styles.headerAppTitle}>LabWatch Dashboard</ThemedText>
      </ThemedView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  customHeaderGradient: {
    paddingTop: Layout.spacing.lg, //
    paddingBottom: Layout.spacing.lg, //
    paddingHorizontal: Layout.spacing.lg, //
  },
  customHeaderContent: {
    backgroundColor: 'transparent', //
  },
  headerGreeting: {
    fontSize: Layout.fontSize.md, //
    color: '#FFFFFF', //
    opacity: 0.8, //
    marginBottom: Layout.spacing.xs, //
  },
  headerAppTitle: {
    fontSize: Layout.fontSize.xxl + 2, //
    fontWeight: Layout.fontWeight.bold, //
    color: '#FFFFFF', //
  },
});

export default DashboardHeader;