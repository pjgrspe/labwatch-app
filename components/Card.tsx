// labwatch-app/components/Card.tsx
import { Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import React, { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { View as ThemedView } from './Themed';

interface CardProps extends PropsWithChildren {
  style?: StyleProp<ViewStyle>;
  disableShadow?: boolean;
  disableBorder?: boolean;
  paddingSize?: keyof typeof Layout.spacing;
}

export default function Card({
  children,
  style,
  disableShadow = false,
  disableBorder = false,
  paddingSize = 'md' // Changed default padding to 'md'
}: CardProps) {
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const theme = useCurrentTheme();

  // Use theme-specific shadow from Layout
  const shadowStyle = theme === 'light' ? Layout.cardShadow : Layout.darkCardShadow;

  return (
    <ThemedView style={[
      styles.cardBase,
      {
        backgroundColor: cardBackgroundColor,
        padding: Layout.spacing[paddingSize]
      },
      !disableBorder && { borderColor: borderColor, borderWidth: StyleSheet.hairlineWidth },
      !disableShadow && shadowStyle,
      style,
    ]}>
      {children}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  cardBase: {
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.md,
  },
});