// labwatch-app/components/ui/Skeleton.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View, ViewProps, ViewStyle } from 'react-native';

export type SkeletonVariant = 'text' | 'rect' | 'circle' | 'card';

interface SkeletonProps extends ViewProps {
  variant?: SkeletonVariant;
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  animated?: boolean;
  children?: React.ReactNode;
}

export default function Skeleton({
  variant = 'text',
  width,
  height,
  borderRadius,
  animated = true,
  children,
  style,
  ...props
}: SkeletonProps) {
  const backgroundColor = useThemeColor({}, 'disabled');
  const highlightColor = useThemeColor({}, 'surfaceSecondary');
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    if (animated) {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 1200,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValue, {
            toValue: 0,
            duration: 1200,
            useNativeDriver: false,
          }),
        ])
      );
      
      animation.start();
      
      return () => {
        animation.stop();
      };
    }
  }, [animated, animatedValue]);
  
  // Get dimensions based on variant
  const getDimensions = (): ViewStyle => {
    switch (variant) {
      case 'text':
        return {
          width: width || '100%',
          height: height || Layout.fontSize.md,
          borderRadius: borderRadius || Layout.borderRadius.sm,
        } as ViewStyle;
      case 'rect':
        return {
          width: width || 100,
          height: height || 100,
          borderRadius: borderRadius || Layout.borderRadius.md,
        } as ViewStyle;
      case 'circle':
        const size = width || 48;
        return {
          width: size,
          height: size,
          borderRadius: 999,
        } as ViewStyle;
      case 'card':
        return {
          width: width || '100%',
          height: height || 120,
          borderRadius: borderRadius || Layout.borderRadius.md,
        } as ViewStyle;
      default:
        return {
          width: width || 100,
          height: height || 24,
          borderRadius: borderRadius || 4,
        } as ViewStyle;
    }
  };
  
  const dimensions = getDimensions();
  
  const animatedBackground = animated
    ? animatedValue.interpolate({
        inputRange: [0, 1],
        outputRange: [backgroundColor, highlightColor],
      })
    : backgroundColor;  
  if (children) {
    return (
      <View style={[styles.container, style]} {...props}>
        <Animated.View
          style={[
            styles.overlay,
            {
              backgroundColor: animatedBackground,
              borderRadius: dimensions.borderRadius as number,
            },
          ]}
        />
        {children}
      </View>
    );
  }
  
  return (
    <Animated.View
      style={[
        {
          width: dimensions.width,
          height: dimensions.height,
          borderRadius: dimensions.borderRadius as number,
          backgroundColor: animatedBackground,
        },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});
