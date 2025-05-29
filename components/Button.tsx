// import { Text as ThemedText } from '@/components/Themed';
// import Layout from '@/constants/Layout';
// import { useThemeColor } from '@/hooks/useThemeColor';
// import { Ionicons } from '@expo/vector-icons';
// import React from 'react';
// import {
//   ActivityIndicator,
//   StyleSheet,
//   TouchableOpacity,
//   TouchableOpacityProps,
//   View,
// } from 'react-native';

// interface AppButtonProps extends TouchableOpacityProps {
//   /** if you pass children, we'll render them instead of title */
//   children?: React.ReactNode;
//   title?: string;
//   onPress: () => void;
//   variant?: 'tint' | 'outline' | 'filled';
//   leftIcon?: keyof typeof Ionicons.glyphMap;
//   rightIcon?: keyof typeof Ionicons.glyphMap;
//   isLoading?: boolean;
//   disabled?: boolean;
//   fullWidth?: boolean;
//   style?: any;
//   textStyle?: any;
//   customIconColor?: string;
// }

// export default function AppButton({
//   children,
//   title,
//   onPress,
//   variant = 'filled',
//   leftIcon,
//   rightIcon,
//   isLoading = false,
//   disabled = false,
//   fullWidth = true,
//   style,
//   textStyle,
//   customIconColor,
//   ...touchableProps
// }: AppButtonProps) {
//   const tintColor = useThemeColor({}, 'tint');
//   const textColor = useThemeColor({}, 'text');

//   const getButtonStyle = () => ({
//     backgroundColor:
//       variant === 'filled' || variant === 'tint' ? tintColor : 'transparent',
//     borderColor: variant === 'outline' ? tintColor : 'transparent',
//     borderWidth: variant === 'outline' ? 1 : 0,
//   });

//   const getTextColor = () =>
//     variant === 'filled' || variant === 'tint' ? '#FFFFFF' : textColor;

//   const iconColor = customIconColor || getTextColor();

//   // Determine the main content for the button (either children or title)
//   const mainButtonContent = children ?? title;

//   const content = isLoading ? (
//     <ActivityIndicator size="small" color={getTextColor()} />
//   ) : (
//     <View style={styles.contentWrapper}>
//       {leftIcon && (
//         <Ionicons
//           name={leftIcon}
//           size={18}
//           color={iconColor}
//           style={styles.leftIcon}
//         />
//       )}
//       {/* If mainButtonContent is a string, wrap it in ThemedText. Otherwise, render as is. */}
//       {typeof mainButtonContent === 'string' ? (
//         <ThemedText
//           style={[styles.buttonText, { color: getTextColor() }, textStyle]}
//         >
//           {mainButtonContent}
//         </ThemedText>
//       ) : (
//         mainButtonContent // Render children directly if they are not a string (e.g., a React element)
//       )}
//       {rightIcon && (
//         <Ionicons
//           name={rightIcon}
//           size={18}
//           color={iconColor}
//           style={styles.rightIcon}
//         />
//       )}
//     </View>
//   );

//   return (
//     <TouchableOpacity
//       style={[
//         styles.button,
//         getButtonStyle(),
//         fullWidth && styles.fullWidth,
//         disabled && styles.disabled,
//         style,
//       ]}
//       onPress={onPress}
//       disabled={disabled || isLoading}
//       activeOpacity={0.7}
//       {...touchableProps}               // no more passing raw children here
//     >
//       {content}
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   button: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: Layout.spacing.sm,
//     paddingHorizontal: Layout.spacing.md,
//     borderRadius: Layout.borderRadius.md,
//     minHeight: 44,
//   },
//   contentWrapper: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'transparent',
//   },
//   fullWidth: {
//     width: '100%',
//   },
//   disabled: {
//     opacity: 0.5,
//   },
//   buttonText: {
//     fontSize: Layout.fontSize.md,
//     fontFamily: 'Montserrat-Medium',
//     textAlign: 'center',
//   },
//   leftIcon: {
//     marginRight: Layout.spacing.xs,
//   },
//   rightIcon: {
//     marginLeft: Layout.spacing.xs,
//   },
// });