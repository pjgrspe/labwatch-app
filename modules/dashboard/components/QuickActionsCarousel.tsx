// labwatch-app/modules/dashboard/components/QuickActionsCarousel.tsx
import { SectionHeader, ThemedText, ThemedView } from '@/components';
import { Colors, Layout } from '@/constants';
import { useCurrentTheme } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

interface QuickAction {
  label: string;
  iconName: keyof typeof Ionicons.glyphMap; // Already correct from Ionicons
  route?: string;
  backgroundColor?: string;
  onPress?: () => void;
  priority?: 'high' | 'medium' | 'low';
}

// Forward ref for TouchableOpacity if used with Animated or other HOCs
const QuickActionCard: React.FC<QuickAction & { currentThemeColors: any }> = ({
  label,
  iconName,
  backgroundColor,
  onPress,
  currentThemeColors, // Renamed to avoid conflict if useThemeColor is used inside
  priority = 'medium',
}) => {
  // If specific theme colors needed here, use useThemeColor hook
  // For simplicity, using passed currentThemeColors
  const defaultBgColor = currentThemeColors.cardBackground;
  const borderColor = currentThemeColors.borderColor;
  const textColor = currentThemeColors.text;
  const iconColorForCard = backgroundColor ? '#FFFFFF' : currentThemeColors.tint;

  const getPriorityStyles = () => {
    switch (priority) {
      case 'high':
        return {
          borderWidth: 1.5, // Slightly thicker for high priority
          borderColor: currentThemeColors.errorText,
          // shadowColor: currentThemeColors.errorText, // Card handles general shadow
          // shadowOpacity: 0.2,
        };
      case 'medium':
        return {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: borderColor,
        };
      case 'low':
        return {
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: borderColor,
          opacity: 0.85, // Slightly less opacity for low priority
        };
      default:
        return {
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: borderColor,
        };
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.quickActionCard,
        { backgroundColor: backgroundColor || defaultBgColor },
        getPriorityStyles(),
        // Layout.cardShadow, // Apply consistent shadow, or let Card component (if wrapped) do it
      ]}
      activeOpacity={0.8}
    >
      <ThemedView 
        style={[
            styles.iconContainer, 
            { backgroundColor: backgroundColor ? 'rgba(255,255,255,0.2)' : currentThemeColors.tint + '15' }
        ]}
      >
        <Ionicons name={iconName} size={28} color={iconColorForCard} />
      </ThemedView>
      <ThemedText 
        style={[styles.quickActionLabel, { color: backgroundColor ? '#FFFFFF' : textColor }]}
        numberOfLines={2} // Allow for slightly longer labels
      >
        {label}
      </ThemedText>
      {priority === 'high' && (
        <ThemedView style={[styles.priorityBadge, { backgroundColor: currentThemeColors.errorText }]}>
          <Ionicons name="flag" size={10} color="#FFFFFF" />
        </ThemedView>
      )}
    </TouchableOpacity>
  );
};

const QuickActionsCarousel = () => {
  const router = useRouter(); // Correct hook import
  const currentThemeHook = useCurrentTheme(); // Correct hook import
  const currentThemeColors = Colors[currentThemeHook];

  const quickActions: QuickAction[] = [
    { 
      label: "Report Incident", 
      iconName: "alert-circle-outline", // More indicative of an incident
      backgroundColor: currentThemeColors.errorText, 
      priority: 'high',
      onPress: () => router.push('/(tabs)/incidents' as any) 
    },
    { 
      label: "Safety Protocols", 
      iconName: "document-text-outline", 
      priority: 'medium',
      onPress: () => router.push('/(tabs)/more/protocols') 
    },
     { 
      label: "Add New Room", 
      iconName: "add-circle-outline", 
      priority: 'medium',
      onPress: () => router.push('/modals/add-room') // Example route
    },
    { 
      label: "User Settings", // More specific
      iconName: "person-circle-outline", 
      priority: 'low',
      onPress: () => router.push('/profile') // Example route to a user profile/settings
    },
    // { 
    //   label: "Manage Users", // This might be admin-specific
    //   iconName: "people-outline", 
    //   priority: 'low',
    //   onPress: () => router.push('/(tabs)/more/admin/manage-users') 
    // },
  ];

  return (
    <View style={styles.container}>
      <SectionHeader 
        title="Quick Actions"
        // SectionHeader's internal padding will be respected by sectionWrapper
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
        // style={styles.scrollView} // Removed to let sectionWrapper handle outer padding
      >
        {quickActions.map((action) => (
          <QuickActionCard key={action.label} {...action} currentThemeColors={currentThemeColors} />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Layout.spacing.md, // Use sectionWrapper's padding
    // marginBottom is handled by spacers in dashboard.tsx.
  },
  // scrollView style removed
  scrollContainer: {
    // This padding is for the content *inside* the scroll view.
    // If sectionWrapper provides Layout.spacing.md, and SectionHeader also has padding,
    // this ensures items don't touch the edges of the scrollable area if it's visually distinct.
    // For a seamless look with sectionWrapper, this could be { paddingLeft: 0 } if SectionHeader manages its own padding.
    // Or, if SectionHeader also uses Layout.spacing.md, this can be removed or set to a smaller value for internal item start.
    // For simplicity, let items start at the edge of the scrollview, which is padded by sectionWrapper.
    paddingLeft: 0, // First item will align with sectionWrapper padding
    paddingRight: Layout.spacing.md, // Ensure last item has space if it scrolls
    paddingVertical: Layout.spacing.xs, // Small vertical padding for the scroll area
  },
  quickActionCard: {
    width: 130, // Slightly reduced width
    height: 110, // Slightly reduced height
    borderRadius: Layout.borderRadius.lg,
    padding: Layout.spacing.sm, // Reduced padding
    marginRight: Layout.spacing.sm, // Reduced margin for tighter packing
    alignItems: 'center',
    justifyContent: 'space-around', // Better distribution
    position: 'relative',
    ...Layout.cardShadow, // Apply consistent shadow
    // borderWidth and borderColor handled by getPriorityStyles
  },
  iconContainer: {
    width: 44, // Slightly smaller
    height: 44, // Slightly smaller
    borderRadius: Layout.borderRadius.md, // Consistent with other icon containers
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  quickActionLabel: {
    fontSize: Layout.fontSize.xs, // Smaller font for compact cards
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    lineHeight: Layout.fontSize.xs * 1.3,
  },
  priorityBadge: {
    position: 'absolute',
    top: Layout.spacing.xs,
    right: Layout.spacing.xs,
    width: 18, // Smaller badge
    height: 18, // Smaller badge
    borderRadius: Layout.borderRadius.sm, // Smaller radius
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default QuickActionsCarousel;