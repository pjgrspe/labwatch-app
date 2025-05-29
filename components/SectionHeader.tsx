// labwatch-app/components/SectionHeader.tsx
import { Text as ThemedText } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import React from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

interface SectionHeaderProps {
  title: string;
  onPressViewAll?: () => void;
  style?: object;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onPressViewAll, style }) => {
  const sectionTitleColor = useThemeColor({ light: '#4A4A4A', dark: '#E0E0E0' }, 'text');
  const viewAllTextColor = useThemeColor({}, 'tint');

  return (
    <View style={[styles.sectionHeader, style]}>
      <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>{title}</ThemedText>
      {onPressViewAll && (
        <TouchableOpacity onPress={onPressViewAll}>
          <ThemedText style={[styles.viewAllText, { color: viewAllTextColor }]}>View all</ThemedText>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.lg,
    marginBottom: Layout.spacing.md,
    marginTop: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.semibold,
  },
  viewAllText: {
    fontSize: Layout.fontSize.sm,
    fontWeight: Layout.fontWeight.medium,
  },
});

export default SectionHeader;