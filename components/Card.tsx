// components/Card.tsx
import Layout from '@/constants/Layout'; // For consistent spacing/border radiuses
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { View as ThemedView } from './Themed'; // Use Themed.View

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
}

export default function Card({ children, style }: CardProps) {
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const theme = useCurrentTheme(); // Get current theme

  // Dynamic shadow based on theme (optional, shadows are often subtle or different on dark mode)
  const shadowStyle = theme === 'light' ? styles.lightShadow : styles.darkShadow;

  return (
    <ThemedView style={[
      styles.cardBase,
      { backgroundColor: cardBackgroundColor, borderColor },
      shadowStyle, // Apply dynamic shadow
      style,
    ]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: Layout.borderRadius.md, // Use Layout constants
    padding: Layout.spacing.md,          // Use Layout constants
    borderWidth: 1,                      // Add borderWidth if you want visible borders
    marginBottom: Layout.spacing.md,     // Use Layout constants
  },
  lightShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  darkShadow: { // Example for dark mode, often shadows are less prominent or different
    shadowColor: '#000', // Or a dark shadow color from your theme
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, // Subtler shadow
    shadowRadius: 2,
    elevation: 2, // Or adjust elevation
  }
});