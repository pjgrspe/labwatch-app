// modules/more/components/MenuSection.tsx
import { Card, SectionHeader, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export interface MenuItem {
  title: string;
  subtitle?: string;
  route?: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress?: () => void;
  showBadge?: boolean;
  badgeText?: string;
  isDestructive?: boolean;
}

interface MenuSectionProps {
  title: string;
  items: MenuItem[];
  onItemPress: (item: MenuItem) => void;
}

const MenuSection: React.FC<MenuSectionProps> = ({ title, items, onItemPress }) => {
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const borderColor = useThemeColor({}, 'borderColor');

  return (
    <ThemedView style={styles.container}>
      <SectionHeader title={title} style={styles.sectionHeader} />
      <Card style={styles.card}>
        {items.map((item, index) => (
          <TouchableOpacity
            key={item.title}
            onPress={() => onItemPress(item)}
            style={[
              styles.menuItem,
              index < items.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: borderColor,
              },
            ]}
            activeOpacity={0.7}
          >
            <ThemedView style={[
              styles.iconContainer,
              { backgroundColor: (item.isDestructive ? errorColor : tintColor) + '15' }
            ]}>
              <Ionicons
                name={item.icon}
                size={22}
                color={item.isDestructive ? errorColor : tintColor}
              />
            </ThemedView>
            
            <ThemedView style={styles.contentContainer}>
              <ThemedText style={[
                styles.title,
                { color: item.isDestructive ? errorColor : textColor }
              ]}>
                {item.title}
              </ThemedText>
              {item.subtitle && (
                <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
                  {item.subtitle}
                </ThemedText>
              )}
            </ThemedView>
            
            <ThemedView style={styles.rightContainer}>
              {item.showBadge && item.badgeText && (
                <ThemedView style={[styles.badge, { backgroundColor: errorColor }]}>
                  <ThemedText style={styles.badgeText}>
                    {item.badgeText}
                  </ThemedText>
                </ThemedView>
              )}
              <Ionicons
                name="chevron-forward-outline"
                size={20}
                color={subtitleColor}
                style={styles.chevron}
              />
            </ThemedView>
          </TouchableOpacity>
        ))}
      </Card>
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  sectionHeader: {
    paddingHorizontal: 0, // SectionHeader already has its own padding
    marginBottom: Layout.spacing.sm,
    marginTop: 0,
  },
  card: {
    paddingVertical: 0,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  contentContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  subtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs / 2,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  badge: {
    borderRadius: Layout.borderRadius.pill,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    marginRight: Layout.spacing.sm,
    minWidth: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
  },
  chevron: {
    marginLeft: Layout.spacing.xs,
  },
});

export default MenuSection;
