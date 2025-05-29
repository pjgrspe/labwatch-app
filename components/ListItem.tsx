// labwatch-app/components/ListItem.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import { Text as ThemedText, View as ThemedView } from './Themed';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean;
  leftIconName?: keyof typeof Ionicons.glyphMap;
  leftIconColor?: string;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
}

export default function ListItem({
  title,
  subtitle,
  onPress,
  rightIconName,
  style,
  showBorder = true,
  leftIconName,
  leftIconColor: customLeftIconColor,
  titleStyle,
  subtitleStyle,
}: ListItemProps) {
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({}, 'borderColor');
  const defaultIconColor = useThemeColor({}, 'icon');
  const leftIconActualColor = useThemeColor({ light: customLeftIconColor, dark: customLeftIconColor }, customLeftIconColor ? 'text' : 'tint');


  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.baseContainer,
        showBorder ? { borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth } : {},
        style
      ]}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      {leftIconName && (
        <Ionicons
          name={leftIconName}
          size={22}
          color={leftIconActualColor}
          style={styles.leftIcon}
        />
      )}
      <ThemedView style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: textColor }, titleStyle]}>{title}</ThemedText>
        {subtitle && <ThemedText style={[styles.subtitle, { color: subtitleColor }, subtitleStyle]}>{subtitle}</ThemedText>}
      </ThemedView>
      {rightIconName && <Ionicons name={rightIconName} size={24} color={defaultIconColor} style={styles.rightIcon} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  baseContainer: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
    marginHorizontal: Layout.spacing.sm,
  },
  title: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold', // Changed for more emphasis
  },
  subtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
    opacity: 0.8,
  },
  leftIcon: {
    marginRight: Layout.spacing.md,
  },
  rightIcon: {
    marginLeft: Layout.spacing.sm,
  }
});