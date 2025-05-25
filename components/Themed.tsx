// labwatch-app/components/Themed.tsx
import { ColorName } from '@/constants/Colors'; // Ensure Colors is imported if not just ColorName
import { useThemeColor } from '@/hooks/useThemeColor'; // Corrected import
import React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

// This local useThemeColor function is fine if you prefer to keep it co-located,
// but it duplicates the one in hooks/useThemeColor.ts.
// It's generally better to import the hook from a single source.
// For this example, I'll assume you want to use the imported hook for clarity.

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // Assuming 'text' is a valid ColorName defined in your Colors.ts
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text' as ColorName);

  return <DefaultText style={[{ color }, style]} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  // Assuming 'background' is a valid ColorName defined in your Colors.ts
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background' as ColorName);

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}