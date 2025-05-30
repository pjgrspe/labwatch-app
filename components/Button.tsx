import Typography from '@/components/Typography';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    ActivityIndicator,
    StyleSheet,
    TouchableOpacity,
    TouchableOpacityProps,
    View,
} from 'react-native';

interface AppButtonProps extends TouchableOpacityProps {
  /** if you pass children, we'll render them instead of title */
  children?: React.ReactNode;
  title?: string;
  onPress: () => void;
  variant?: 'tint' | 'outline' | 'filled' | 'text' | 'success' | 'danger';
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  isLoading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  style?: any;
  textStyle?: any;
  customIconColor?: string;
}

export default function AppButton({
  children,
  title,
  onPress,
  variant = 'filled',
  leftIcon,
  rightIcon,
  isLoading = false,
  disabled = false,
  fullWidth = true,
  size = 'md',
  style,
  textStyle,
  customIconColor,
  ...touchableProps
}: AppButtonProps) {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const successColor = useThemeColor({}, 'successText');
  const dangerColor = useThemeColor({}, 'errorText');

  const getButtonStyle = () => {
    // Base button style based on variant
    let baseStyle = {};

    switch (variant) {
      case 'filled':
        baseStyle = {
          backgroundColor: tintColor,
          borderColor: 'transparent',
          borderWidth: 0,
        };
        break;
      case 'tint':
        baseStyle = {
          backgroundColor: tintColor,
          borderColor: 'transparent',
          borderWidth: 0,
        };
        break;
      case 'outline':
        baseStyle = {
          backgroundColor: 'transparent',
          borderColor: tintColor,
          borderWidth: 1,
        };
        break;
      case 'text':
        baseStyle = {
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderWidth: 0,
        };
        break;
      case 'success':
        baseStyle = {
          backgroundColor: successColor,
          borderColor: 'transparent',
          borderWidth: 0,
        };
        break;
      case 'danger':
        baseStyle = {
          backgroundColor: dangerColor,
          borderColor: 'transparent',
          borderWidth: 0,
        };
        break;
    }

    return baseStyle;
  };

  const getTextColor = () => {
    if (
      variant === 'filled' ||
      variant === 'tint' ||
      variant === 'success' ||
      variant === 'danger'
    ) {
      return '#FFFFFF';
    } else if (variant === 'text') {
      return tintColor;
    } else {
      return textColor;
    }
  };

  const iconColor = customIconColor || getTextColor();

  // Get the correct button height based on size
  const getButtonHeight = () => {
    switch (size) {
      case 'sm':
        return 36;
      case 'lg':
        return 52;
      case 'md':
      default:
        return 44;
    }
  };

  // Get the correct padding based on size
  const getButtonPadding = () => {
    switch (size) {
      case 'sm':
        return {
          paddingVertical: Layout.spacing.xs,
          paddingHorizontal: Layout.spacing.sm,
        };
      case 'lg':
        return {
          paddingVertical: Layout.spacing.md,
          paddingHorizontal: Layout.spacing.lg,
        };
      case 'md':
      default:
        return {
          paddingVertical: Layout.spacing.sm,
          paddingHorizontal: Layout.spacing.md,
        };
    }
  };

  // Determine the main content for the button (either children or title)
  const mainButtonContent = children ?? title;

  const content = isLoading ? (
    <ActivityIndicator size="small" color={getTextColor()} />
  ) : (
    <View style={styles.contentWrapper}>
      {leftIcon && (
        <Ionicons
          name={leftIcon}
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          color={iconColor}
          style={styles.leftIcon}
        />
      )}
      {/* If mainButtonContent is a string, wrap it in Typography. Otherwise, render as is. */}
      {typeof mainButtonContent === 'string' ? (
        <Typography
          variant="button"
          style={[
            styles.buttonText,
            {
              color: getTextColor(),
              fontSize: size === 'sm' ? 14 : size === 'lg' ? 16 : 15,
            },
            textStyle,
          ]}
        >
          {mainButtonContent}
        </Typography>
      ) : (
        mainButtonContent // Render children directly if they are not a string (e.g., a React element)
      )}
      {rightIcon && (
        <Ionicons
          name={rightIcon}
          size={size === 'sm' ? 16 : size === 'lg' ? 20 : 18}
          color={iconColor}
          style={styles.rightIcon}
        />
      )}
    </View>
  );

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getButtonStyle(),
        getButtonPadding(),
        { minHeight: getButtonHeight() },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || isLoading}
      activeOpacity={0.7}
      {...touchableProps}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Layout.borderRadius.md,
  },
  contentWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  leftIcon: {
    marginRight: Layout.spacing.xs,
  },
  rightIcon: {
    marginLeft: Layout.spacing.xs,
  },
});