// labwatch-app/components/Themed.tsx
import { ColorName } from '@/constants/Colors';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { Text as DefaultText, View as DefaultView } from 'react-native';

type ThemeProps = {
  lightColor?: string;
  darkColor?: string;
};

export type TextProps = ThemeProps & DefaultText['props'];
export type ViewProps = ThemeProps & DefaultView['props'];

export function Text(props: TextProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text' as ColorName);

  return <DefaultText style={[{ color, fontFamily: 'Montserrat-Regular' }, style]} {...otherProps} />; // Added fontFamily
}

export function View(props: ViewProps) {
  const { style, lightColor, darkColor, ...otherProps } = props;
  const backgroundColor = useThemeColor({ light: lightColor, dark: darkColor }, 'background' as ColorName);

  return <DefaultView style={[{ backgroundColor }, style]} {...otherProps} />;
}