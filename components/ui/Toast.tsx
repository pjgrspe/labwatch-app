// labwatch-app/components/ui/Toast.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import {
    Animated,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ViewProps
} from 'react-native';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastPosition = 'top' | 'bottom';

interface ToastProps extends ViewProps {
  visible: boolean;
  message: string;
  type?: ToastType;
  duration?: number;
  position?: ToastPosition;
  onClose?: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
}

export default function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  position = 'bottom',
  onClose,
  action,
  style,
  ...props
}: ToastProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.Value(position === 'top' ? -100 : 100)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const textColor = '#FFFFFF';
  const iconColor = '#FFFFFF';
  
  // Get background color based on toast type
  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return useThemeColor({}, 'successText');
      case 'error':
        return useThemeColor({}, 'errorText');
      case 'warning':
        return useThemeColor({}, 'warningText');
      case 'info':
      default:
        return useThemeColor({}, 'tint');
    }
  };

  // Get icon based on toast type
  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'warning';
      case 'info':
      default:
        return 'information-circle';
    }
  };

  const showToast = () => {
    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Set timer to hide toast
    if (duration > 0) {
      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    }
  };

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(positionAnim, {
        toValue: position === 'top' ? -100 : 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  useEffect(() => {
    if (visible) {
      showToast();
    } else {
      hideToast();
    }

    // Clean up timer on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [visible]);

  const translateYValue = position === 'top' ? 
    positionAnim : 
    positionAnim.interpolate({
      inputRange: [0, 100],
      outputRange: [0, 100],
    });

  return (
    <Animated.View
      style={[
        styles.container,
        position === 'top' ? styles.topPosition : styles.bottomPosition,
        {
          opacity: fadeAnim,
          transform: [{ translateY: translateYValue }],
          backgroundColor: getBackgroundColor(),
        },
        style,
      ]}
      {...props}
    >
      <View style={styles.contentContainer}>
        <Ionicons name={getIcon()} size={20} color={iconColor} style={styles.icon} />
        <Text style={[styles.message, { color: textColor }]}>{message}</Text>
      </View>
      
      <View style={styles.actionsContainer}>
        {action && (
          <TouchableOpacity onPress={action.onPress} style={styles.actionButton}>
            <Text style={[styles.actionText, { color: textColor }]}>
              {action.label}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons name="close" size={18} color={iconColor} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
    zIndex: 1000,
    maxWidth: 500,
    alignSelf: 'center',
  },
  topPosition: {
    top: 50,
  },
  bottomPosition: {
    bottom: 50,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: Layout.spacing.sm,
  },
  message: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    flexShrink: 1,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Layout.spacing.sm,
  },
  actionButton: {
    marginRight: Layout.spacing.sm,
  },
  actionText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Bold',
    textDecorationLine: 'underline',
  },
  closeButton: {
    padding: 4,
  },
});
