// labwatch-app/components/Input.tsx
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef } from 'react';
import {
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    View,
} from 'react-native';

export interface AppInputProps extends TextInputProps {
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  fullWidth?: boolean;
  disabled?: boolean;
  helpText?: string;
  containerStyle?: any;
  inputStyle?: any;
  labelStyle?: any;
  required?: boolean;
}

const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      error,
      leftIcon,
      rightIcon,
      onRightIconPress,
      fullWidth = true,
      disabled = false,
      helpText,
      containerStyle,
      inputStyle,
      labelStyle,
      required = false,
      ...props
    },
    ref
  ) => {
    const currentTheme = useCurrentTheme();
    const inputBackgroundColor = useThemeColor({}, 'inputBackground');
    const inputBorderColor = useThemeColor({}, error ? 'errorText' : 'inputBorder');
    const textColor = useThemeColor({}, 'text');
    const placeholderColor = useThemeColor({}, 'inputPlaceholder');
    const labelColor = useThemeColor({}, 'text');
    const errorColor = useThemeColor({}, 'errorText');
    const helpTextColor = useThemeColor({}, 'icon');
    const iconColor = useThemeColor({}, 'icon');
    const disabledColor = useThemeColor({}, 'disabled');
    
    const focusBorderColor = Colors[currentTheme].inputFocusBorder;
    
    const [isFocused, setIsFocused] = React.useState(false);

    return (
      <View style={[styles.container, fullWidth && styles.fullWidth, containerStyle]}>
        {label && (
          <View style={styles.labelContainer}>
            <Text 
              style={[
                styles.label, 
                { color: labelColor },
                labelStyle
              ]}
            >
              {label}
              {required && <Text style={{ color: errorColor }}> *</Text>}
            </Text>
          </View>
        )}
        
        <View style={[
          styles.inputContainer,
          { 
            backgroundColor: disabled ? disabledColor : inputBackgroundColor,
            borderColor: isFocused ? focusBorderColor : inputBorderColor,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}>
          {leftIcon && (
            <Ionicons 
              name={leftIcon} 
              size={20} 
              color={disabled ? disabledColor : iconColor} 
              style={styles.leftIcon} 
            />
          )}
          
          <TextInput
            ref={ref}
            style={[
              styles.input, 
              { color: disabled ? disabledColor : textColor },
              leftIcon && styles.inputWithLeftIcon,
              rightIcon && styles.inputWithRightIcon,
              inputStyle
            ]}
            placeholderTextColor={placeholderColor}
            editable={!disabled}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          
          {rightIcon && (
            <TouchableOpacity 
              onPress={onRightIconPress} 
              disabled={disabled || !onRightIconPress}
              style={styles.rightIconContainer}
            >
              <Ionicons 
                name={rightIcon} 
                size={20} 
                color={disabled ? disabledColor : iconColor} 
              />
            </TouchableOpacity>
          )}
        </View>
        
        {(error || helpText) && (
          <Text 
            style={[
              styles.helperText, 
              { color: error ? errorColor : helpTextColor }
            ]}
          >
            {error || helpText}
          </Text>
        )}
      </View>
    );
  }
);

AppInput.displayName = 'AppInput';

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  fullWidth: {
    width: '100%',
  },
  labelContainer: {
    marginBottom: Layout.spacing.xs,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Layout.borderRadius.md,
    minHeight: 48, // Taller input for better touch targets
    paddingHorizontal: Layout.spacing.md,
  },
  input: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    paddingVertical: Platform.OS === 'ios' ? Layout.spacing.sm : Layout.spacing.xs,
  },
  inputWithLeftIcon: {
    paddingLeft: Layout.spacing.sm,
  },
  inputWithRightIcon: {
    paddingRight: Layout.spacing.sm,
  },
  leftIcon: {
    marginRight: Layout.spacing.xs,
  },
  rightIconContainer: {
    padding: Layout.spacing.xs,
  },
  helperText: {
    fontSize: Layout.fontSize.xs,
    marginTop: Layout.spacing.xs,
    fontFamily: 'Montserrat-Regular',
  },
});

export default AppInput;