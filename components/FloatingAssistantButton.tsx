// labwatch-app/components/FloatingAssistantButton.tsx
import Layout from '@/constants/Layout'; // Import Layout
import { useCurrentTheme, useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

export default function FloatingAssistantButton() {
  const router = useRouter();
  const fabBackgroundColor = useThemeColor({}, 'tint');
  // Assuming primaryCallToActionText is white or light enough for good contrast on tint
  const fabIconColor = useThemeColor({}, 'primaryCallToActionText');
  const theme = useCurrentTheme();
  const shadowStyle = theme === 'light' ? Layout.cardShadow : Layout.darkCardShadow;

  const navigateToAssistant = () => {
    router.push('/assistant'); // Ensure this route is defined in your root layout
  };

  return (
    <TouchableOpacity
      style={[
        styles.fab,
        { backgroundColor: fabBackgroundColor },
        shadowStyle // Apply dynamic shadow from Layout
      ]}
      onPress={navigateToAssistant}
      activeOpacity={0.8}
    >
      <Ionicons name="chatbubble-ellipses-outline" size={28} color={fabIconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: Layout.spacing.lg, // Use Layout spacing
    right: Layout.spacing.sm,  // Adjusted for better placement
    bottom: Layout.spacing.lg + (Layout.spacing.sm*2), // Ensure it's above potential tab bar
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.pill, // Use pill for circular
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    // Shadow properties are now applied from Layout.cardShadow or Layout.darkCardShadow
  },
});