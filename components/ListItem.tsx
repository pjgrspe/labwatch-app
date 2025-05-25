// components/ListItem.tsx
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native';

interface ListItemProps {
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}

export default function ListItem({ title, subtitle, onPress, rightIconName, style }: ListItemProps) {
  return (
    <TouchableOpacity onPress={onPress} style={[styles.container, style]} disabled={!onPress}>
      <View style={styles.textContainer}>
        <Text style={styles.title}>{title}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightIconName && <Ionicons name={rightIconName} size={24} color="#ccc" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    marginTop: 2,
  },
});