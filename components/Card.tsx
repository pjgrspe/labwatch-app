// labwatch-app/components/Card.tsx
import Layout from '@/constants/Layout';
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { View as ThemedView } from './Themed';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  disableShadow?: boolean;
  disableBorder?: boolean;
}

export default function Card({ children, style, disableShadow = false, disableBorder = false }: CardProps) {
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const theme = useCurrentTheme();

  // Use shadow styles from Layout constants
  const shadowStyle = theme === 'light' ? Layout.cardShadow : Layout.darkCardShadow;

  return (
    <ThemedView style={[
      styles.cardBase,
      { backgroundColor: cardBackgroundColor },
      !disableBorder && { borderColor: borderColor, borderWidth: 1 },
      !disableShadow && shadowStyle,
      style, // Allows overriding individual styles
    ]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: Layout.borderRadius.md,
    padding: Layout.spacing.lg,      // Updated padding
    marginBottom: Layout.spacing.lg, // Consistent margin
  },
});