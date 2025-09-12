// labwatch-app/components/FloatingAssistantButton.tsx
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React from 'react';
import {
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const BUTTON_SIZE = 60;
const MARGIN = 20;

export default function FloatingAssistantButton() {
  const router = useRouter();
  const segments = useSegments();
  const theme = useCurrentTheme();
  
  // Use secondary blue color (brandCyan)
  const fabBackgroundColor = useThemeColor(
    { light: Colors.light.accent, dark: Colors.dark.accent }, 
    'accent'
  );
  const fabIconColor = '#FFFFFF';
  const shadowStyle = theme === 'light' ? Layout.cardShadow : Layout.darkCardShadow;

  // Check if we're on the dashboard tab
  const isOnDashboardTab = React.useMemo(() => {
    // Convert segments to strings for safe comparison
    const segmentStrings = segments.map(String);
    
    // Check if we're on dashboard route
    return segmentStrings.includes('dashboard') || 
           (segmentStrings.length === 1 && segmentStrings[0] === '(tabs)') ||
           segmentStrings.length === 0; // Root level
  }, [segments]);

  // Don't render if not on dashboard tab
  if (!isOnDashboardTab) {
    return null;
  }

  const navigateToAssistant = () => {
    router.push('/assistant');
  };

  return (
    <View style={styles.container} pointerEvents="box-none">
      <TouchableOpacity
        style={[
          styles.fab,
          { backgroundColor: fabBackgroundColor },
          shadowStyle,
        ]}
        onPress={navigateToAssistant}
        activeOpacity={0.8}
      >
        <Ionicons 
          name="chatbubble-ellipses-outline" 
          size={28} 
          color={fabIconColor} 
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: MARGIN + 100, // 100px from bottom for tab bar space
    right: MARGIN,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    pointerEvents: 'box-none',
  },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
  },
});