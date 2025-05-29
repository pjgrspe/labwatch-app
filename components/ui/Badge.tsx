// labwatch-app/components/ui/Badge.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import Typography from '../Typography';

export type BadgeVariant = 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'sm' | 'md' | 'lg';

interface BadgeProps extends ViewProps {
  label?: string;
  variant?: BadgeVariant;
  size?: BadgeSize;
  icon?: keyof typeof Ionicons.glyphMap;
  pill?: boolean;
  outline?: boolean;
  dot?: boolean;
}

export default function Badge({
  label,
  variant = 'default',
  size = 'md',
  icon,
  pill = false,
  outline = false,
  dot = false,
  style,
  ...props
}: BadgeProps) {
  // Get colors based on variant
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return {
          bg: useThemeColor({}, 'tint'),
          text: '#FFFFFF',
        };
      case 'success':
        return {
          bg: useThemeColor({}, 'successText'),
          text: '#FFFFFF',
        };
      case 'warning':
        return {
          bg: useThemeColor({}, 'warningText'),
          text: '#FFFFFF',
        };
      case 'error':
        return {
          bg: useThemeColor({}, 'errorText'),
          text: '#FFFFFF',
        };
      case 'info':
        return {
          bg: useThemeColor({}, 'infoText'),
          text: '#FFFFFF',
        };
      default:
        return {
          bg: useThemeColor({}, 'surfaceSecondary'),
          text: useThemeColor({}, 'text'),
        };
    }
  };

  // Get size-based styles
  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: 2,
          paddingHorizontal: 6,
          fontSize: Layout.fontSize.xs,
          iconSize: 12,
        };
      case 'lg':
        return {
          paddingVertical: 6,
          paddingHorizontal: 12,
          fontSize: Layout.fontSize.md,
          iconSize: 18,
        };
      case 'md':
      default:
        return {
          paddingVertical: 4,
          paddingHorizontal: 8,
          fontSize: Layout.fontSize.sm,
          iconSize: 14,
        };
    }
  };

  const colors = getColors();
  const sizeStyles = getSizeStyles();
  
  // Style for outline variant
  const outlineStyle = outline
    ? {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: colors.bg,
      }
    : { backgroundColor: colors.bg };
  
  // Adjust text color for outline variant
  const textColor = outline ? colors.bg : colors.text;

  return (
    <View
      style={[
        styles.badge,
        outlineStyle,
        { 
          borderRadius: pill ? 999 : Layout.borderRadius.sm,
          paddingVertical: sizeStyles.paddingVertical,
          paddingHorizontal: sizeStyles.paddingHorizontal,
        },
        style,
      ]}
      {...props}
    >
      {dot && (
        <View style={[styles.dot, { backgroundColor: outline ? colors.bg : colors.text }]} />
      )}
      
      {icon && (
        <Ionicons
          name={icon}
          size={sizeStyles.iconSize}
          color={textColor}
          style={styles.icon}
        />
      )}
      
      {label && (
        <Typography
          variant="caption"
          style={[
            { 
              color: textColor,
              fontSize: sizeStyles.fontSize,
              fontFamily: 'Montserrat-Medium' 
            },
          ]}
        >
          {label}
        </Typography>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4,
  },
  icon: {
    marginRight: 4,
  },
});