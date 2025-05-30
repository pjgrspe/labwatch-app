// labwatch-app/components/FloatingAssistantButton.tsx
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useSegments } from 'expo-router';
import React, { useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State
} from 'react-native-gesture-handler';

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

  // Separate animation values - position uses non-native driver, scale/opacity use native driver
  const translateX = useRef(new Animated.Value(screenWidth - BUTTON_SIZE - MARGIN)).current;
  const translateY = useRef(new Animated.Value(screenHeight - BUTTON_SIZE - MARGIN - 100)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  
  // State for gesture handling
  const [isDragging, setIsDragging] = useState(false);
  const lastOffset = useRef({ 
    x: screenWidth - BUTTON_SIZE - MARGIN, 
    y: screenHeight - BUTTON_SIZE - MARGIN - 100 
  });  // Check if we're on the home/dashboard tab
  const isOnHomeTab = React.useMemo(() => {
    // Convert segments to strings for safe comparison
    const segmentStrings = segments.map(String);
    
    // Check if we're on dashboard route
    return segmentStrings.includes('dashboard') || 
           (segmentStrings.length === 1 && segmentStrings[0] === '(tabs)') ||
           segmentStrings.length === 0; // Root level
  }, [segments]);

  // Don't render if not on home tab
  if (!isOnHomeTab) {
    return null;
  }

  const navigateToAssistant = () => {
    if (!isDragging) {
      router.push('/assistant');
    }
  };

  const onGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: false }
  );

  const onHandlerStateChange = (event: any) => {
    const { state, translationX, translationY, absoluteX, absoluteY } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      setIsDragging(true);
      // Scale and opacity animations with native driver
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1.1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(opacity, {
          toValue: 0.8,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
    } else if (state === State.END) {
      // Calculate final position
      const newX = lastOffset.current.x + translationX;
      const newY = lastOffset.current.y + translationY;
      
      // Constrain to screen bounds
      const constrainedX = Math.max(MARGIN, Math.min(screenWidth - BUTTON_SIZE - MARGIN, newX));
      const constrainedY = Math.max(MARGIN, Math.min(screenHeight - BUTTON_SIZE - MARGIN - 100, newY));
      
      // Snap to nearest edge (left or right)
      const snapToRight = constrainedX > screenWidth / 2;
      const finalX = snapToRight ? screenWidth - BUTTON_SIZE - MARGIN : MARGIN;
      
      // Animate to final position (non-native driver for position)
      Animated.parallel([
        Animated.spring(translateX, {
          toValue: finalX,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: constrainedY,
          useNativeDriver: false,
          tension: 100,
          friction: 8,
        }),
      ]).start();
      
      // Animate scale and opacity back (native driver)
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
      ]).start();
      
      // Update last offset
      lastOffset.current.x = finalX;
      lastOffset.current.y = constrainedY;
      
      // Reset translate values to 0 since we updated lastOffset
      translateX.setValue(0);
      translateY.setValue(0);
      
      // Small delay to prevent accidental navigation
      setTimeout(() => {
        setIsDragging(false);
      }, 200);
    }
  };

  return (
    <GestureHandlerRootView style={styles.gestureContainer} pointerEvents="box-none">
      <PanGestureHandler
        onGestureEvent={onGestureEvent}
        onHandlerStateChange={onHandlerStateChange}
      >
        <Animated.View
          style={[
            styles.container,
            {
              left: lastOffset.current.x,
              top: lastOffset.current.y,
              transform: [
                { translateX },
                { translateY },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.fab,
              { backgroundColor: fabBackgroundColor },
              shadowStyle,
              isDragging && styles.dragging,
            ]}
            onPress={navigateToAssistant}
            activeOpacity={0.8}
            disabled={isDragging}
          >
            <Ionicons 
              name="chatbubble-ellipses-outline" 
              size={28} 
              color={fabIconColor} 
            />
          </TouchableOpacity>        </Animated.View>
      </PanGestureHandler>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  gestureContainer: {
    ...StyleSheet.absoluteFillObject,
    pointerEvents: 'box-none',
  },
  container: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    left: screenWidth - BUTTON_SIZE - MARGIN,
    top: screenHeight - BUTTON_SIZE - MARGIN - 100,
  },
  fab: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8, // Android shadow
  },
  dragging: {
    elevation: 12, // Increase shadow when dragging
  },
});