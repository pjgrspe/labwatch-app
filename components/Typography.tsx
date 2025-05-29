// labwatch-app/components/Typography.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import React from 'react';
import { Text as RNText, TextProps as RNTextProps, StyleProp, StyleSheet, TextStyle } from 'react-native';

export type TypographyVariant = 
  | 'h1' 
  | 'h2' 
  | 'h3' 
  | 'h4' 
  | 'subtitle1' 
  | 'subtitle2' 
  | 'body1' 
  | 'body2'
  | 'button'
  | 'caption'
  | 'overline';

export interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  align?: 'auto' | 'left' | 'right' | 'center' | 'justify';
  weight?: 'normal' | 'bold' | 'light' | 'medium' | 'semibold';
  italic?: boolean;
  gutterBottom?: boolean;
  noWrap?: boolean;
  style?: StyleProp<TextStyle>;
}

export default function Typography({
  variant = 'body1',
  color,
  align = 'left',
  weight,
  italic = false,
  gutterBottom = false,
  noWrap = false,
  style,
  children,
  ...rest
}: TypographyProps) {
  const defaultColor = useThemeColor({}, 'text');
  const textColor = color || defaultColor;

  // Get font style from weight or variant
  const getFontFamily = () => {
    if (weight === 'bold') return 'Montserrat-Bold';
    if (weight === 'semibold') return 'Montserrat-SemiBold';
    if (weight === 'medium') return 'Montserrat-Medium';
    if (weight === 'light') return 'Montserrat-Light';
    
    // If no explicit weight is specified, use the default for the variant
    if (variant === 'h1' || variant === 'h2') return 'Montserrat-Bold';
    if (variant === 'h3' || variant === 'h4' || variant === 'button') return 'Montserrat-SemiBold';
    if (variant === 'subtitle1' || variant === 'subtitle2') return 'Montserrat-Medium';
    
    return italic ? 'Montserrat-Italic' : 'Montserrat-Regular';
  };

  return (
    <RNText
      style={[
        styles.base,
        styles[variant],
        {
          color: textColor,
          textAlign: align,
          fontFamily: getFontFamily(),
        },
        gutterBottom && styles.gutterBottom,
        noWrap && styles.noWrap,
        style,
      ]}
      {...rest}
    >
      {children}
    </RNText>
  );
}

const styles = StyleSheet.create({
  base: {
    fontSize: Layout.fontSize.md,
  },
  gutterBottom: {
    marginBottom: Layout.spacing.sm,
  },
  noWrap: {
    flexShrink: 1,
    flexWrap: 'nowrap',
  },
  h1: {
    fontSize: Layout.fontSize.xxl,
    lineHeight: Layout.fontSize.xxl * 1.2,
    letterSpacing: -0.5,
  },
  h2: {
    fontSize: Layout.fontSize.xl,
    lineHeight: Layout.fontSize.xl * 1.2,
    letterSpacing: -0.25,
  },
  h3: {
    fontSize: Layout.fontSize.lg,
    lineHeight: Layout.fontSize.lg * 1.3,
  },
  h4: {
    fontSize: Layout.fontSize.md + 2,
    lineHeight: (Layout.fontSize.md + 2) * 1.3,
  },
  subtitle1: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * 1.5,
    letterSpacing: 0.15,
  },
  subtitle2: {
    fontSize: Layout.fontSize.sm,
    lineHeight: Layout.fontSize.sm * 1.5,
    letterSpacing: 0.1,
  },
  body1: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * 1.5,
    letterSpacing: 0.5,
  },
  body2: {
    fontSize: Layout.fontSize.sm,
    lineHeight: Layout.fontSize.sm * 1.5,
    letterSpacing: 0.25,
  },
  button: {
    fontSize: Layout.fontSize.md,
    lineHeight: Layout.fontSize.md * 1.5,
    letterSpacing: 0.75,
    textTransform: 'uppercase' as const,
  },
  caption: {
    fontSize: Layout.fontSize.xs,
    lineHeight: Layout.fontSize.xs * 1.5,
    letterSpacing: 0.4,
  },
  overline: {
    fontSize: Layout.fontSize.xs,
    lineHeight: Layout.fontSize.xs * 1.5,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
});
