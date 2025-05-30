// labwatch-app/components/ui/Tabs.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View, ViewProps } from 'react-native';
import Typography from '../Typography';

export interface TabItem {
  key: string;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  badge?: number;
  disabled?: boolean;
}

interface TabsProps extends ViewProps {
  tabs: TabItem[];
  selectedTab: string;
  onTabChange: (tabKey: string) => void;
  variant?: 'default' | 'underlined' | 'pills';
  scrollable?: boolean;
  fullWidth?: boolean;
}

export default function Tabs({
  tabs,
  selectedTab,
  onTabChange,
  variant = 'default',
  scrollable = false,
  fullWidth = false,
  style,
  ...props
}: TabsProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const disabledColor = useThemeColor({}, 'disabledText');

  const TabsContainer = scrollable ? ScrollView : View;
  const containerProps = scrollable 
    ? { 
        horizontal: true, 
        showsHorizontalScrollIndicator: false,
        contentContainerStyle: fullWidth ? styles.scrollableFull : styles.scrollable
      } 
    : {};

  const renderTab = (tab: TabItem, index: number) => {
    const isSelected = selectedTab === tab.key;
    const isDisabled = tab.disabled;
    
    // Determine styles based on variant
    const getTabStyle = () => {
      switch (variant) {
        case 'pills':
          return [
            styles.pillTab,
            isSelected && { backgroundColor: tintColor },
          ];
        case 'underlined':
          return [
            styles.underlinedTab,
            { borderBottomColor: isSelected ? tintColor : 'transparent' },
          ];
        default:
          return [
            styles.defaultTab,
            index === 0 && styles.firstTab,
            index === tabs.length - 1 && styles.lastTab,
            { borderBottomColor: isSelected ? tintColor : borderColor },
            isSelected && { borderBottomWidth: 2 },
          ];
      }
    };

    // Determine text color based on variant and selection state
    const getTextColor = () => {
      if (isDisabled) return disabledColor;
      
      if (variant === 'pills' && isSelected) {
        return '#FFFFFF';
      }
      
      return isSelected ? tintColor : textColor;
    };

    return (
      <TouchableOpacity
        key={tab.key}
        onPress={() => !isDisabled && onTabChange(tab.key)}
        disabled={isDisabled}
        style={[
          styles.tab,
          fullWidth && !scrollable && styles.fullWidthTab,
          getTabStyle(),
        ]}
        activeOpacity={0.7}
      >
        {tab.icon && (
          <Ionicons
            name={tab.icon}
            size={18}
            color={getTextColor()}
            style={styles.tabIcon}
          />
        )}
        
        <Typography
          variant="subtitle2"
          color={getTextColor()}
          style={[
            styles.tabLabel,
            isSelected && styles.selectedTabLabel,
          ]}
        >
          {tab.label}
        </Typography>
        
        {tab.badge !== undefined && tab.badge > 0 && (
          <View style={styles.badge}>
            <Typography
              variant="caption"
              color="#FFFFFF"
              style={styles.badgeText}
            >
              {tab.badge > 99 ? '99+' : tab.badge}
            </Typography>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, style]} {...props}>
      <TabsContainer
        style={[
          styles.tabsContainer,
          { backgroundColor },
          variant === 'default' && { borderBottomColor: borderColor, borderBottomWidth: 1 },
        ]}
        {...containerProps}
      >
        {tabs.map((tab, index) => renderTab(tab, index))}
      </TabsContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  tabsContainer: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
  },
  scrollable: {
    paddingHorizontal: Layout.spacing.sm,
  },
  scrollableFull: {
    flexGrow: 1,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
  },
  fullWidthTab: {
    flex: 1,
  },
  // Default tab styles
  defaultTab: {
    borderBottomWidth: 1,
  },
  firstTab: {
    paddingLeft: Layout.spacing.lg,
  },
  lastTab: {
    paddingRight: Layout.spacing.lg,
  },
  // Underlined tab styles
  underlinedTab: {
    borderBottomWidth: 2,
  },
  // Pill tab styles
  pillTab: {
    borderRadius: Layout.borderRadius.pill,
    marginHorizontal: 4,
    paddingHorizontal: Layout.spacing.md,
  },
  tabIcon: {
    marginRight: 6,
  },
  tabLabel: {
    textAlign: 'center',
  },
  selectedTabLabel: {
    fontFamily: 'Montserrat-SemiBold',
  },
  badge: {
    backgroundColor: 'red',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Medium',
  },
});
