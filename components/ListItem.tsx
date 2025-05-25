// components/ListItem.tsx
import Layout from '@/constants/Layout'; // For consistent spacing
import { useThemeColor } from '@/hooks/useThemeColor'; // Import useThemeColor
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { Text as ThemedText, View as ThemedView } from './Themed'; // Use Themed components

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
  showBorder?: boolean; // Added prop to control border visibility
}

export default function ListItem({
  title,
  subtitle,
  onPress,
  rightIconName,
  style,
  showBorder = true, // Default to true
}: ListItemProps) {
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon'); // Using 'icon' color for subtitle as an example
  const borderColor = useThemeColor({}, 'borderColor');
  const iconColor = useThemeColor({}, 'icon'); // For the right icon

  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, showBorder && { borderBottomColor: borderColor }, style]} disabled={!onPress}>
      <ThemedView style={styles.textContainer}>
        <ThemedText style={[styles.title, { color: textColor }]}>{title}</ThemedText>
        {subtitle && <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>{subtitle}</ThemedText>}
      </ThemedView>
      {rightIconName && <Ionicons name={rightIconName} size={24} color={iconColor} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    // backgroundColor will be handled by ThemedView if ListItem itself is wrapped or becomes one
    // For TouchableOpacity, we might not need a background here unless it's specifically styled.
    paddingVertical: Layout.spacing.sm + Layout.spacing.xs, // 12
    paddingHorizontal: Layout.spacing.md, // 16
    borderBottomWidth: StyleSheet.hairlineWidth,
    // borderBottomColor will be set dynamically
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent', // Ensure ThemedView inside TouchableOpacity doesn't show its own bg if not intended
  },
  title: {
    fontSize: 16,
    // color will be set dynamically
  },
  subtitle: {
    fontSize: 14,
    // color will be set dynamically
    marginTop: 2,
  },
});