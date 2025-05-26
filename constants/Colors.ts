// labwatch-app/constants/Colors.ts
const tintColorLight = '#6F57FF'; // A vibrant purple-blue
const tintColorDark = '#8A7DFF'; // A slightly lighter purple-blue for dark mode contrast

export const Colors = {
  light: {
    text: '#1C1C1E', // Darker text for better readability
    background: '#F4F5F7', // Very light gray, almost white
    tint: tintColorLight,
    icon: '#6E7781', // Medium gray for icons and subtle text
    tabIconDefault: '#AEB3B9',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    borderColor: '#E5E5EA', // Lighter border color
    errorText: '#FF3B30',
    warningText: '#FF9500',
    successText: '#34C759',
    infoText: '#007AFF', // Standard info blue, can be adjusted if needed
    headerBackground: '#FFFFFF', // Cleaner white header
    headerTint: tintColorLight, // Accent color for header text/icons

    // New additions inspired by the image
    subtleBackground: '#F9FAFB', // For elements that need to be slightly off the main background
    primaryCallToActionBackground: tintColorLight,
    primaryCallToActionText: '#FFFFFF',
    secondaryCallToActionBackground: '#E5E5EA',
    secondaryCallToActionText: '#1C1C1E',
    disabledText: '#AEB3B9',
    gradientStart: '#7F57FF', // Corrected potential typo G->7
    gradientEnd: '#6F57FF',
    inputBackground: '#FFFFFF', // For text inputs on light theme
    inputPlaceholder: '#9A9A9E', // For placeholder text in inputs
    switchThumbDisabled: '#BDBDBD',
    switchTrackDisabled: '#E0E0E0',
  },
  dark: {
    text: '#E5E5EA', // Lighter text for dark mode
    background: '#0D1117', // Dark charcoal, almost black
    tint: tintColorDark,
    icon: '#8A949F', // Lighter gray for icons in dark mode
    tabIconDefault: '#586069',
    tabIconSelected: tintColorDark,
    cardBackground: '#1A1F2A', // Darker card background
    borderColor: '#30363D', // Darker border
    errorText: '#FF6B6B',
    warningText: '#FFAA5C',
    successText: '#56D364',
    infoText: '#58A6FF',
    headerBackground: '#161B22', // Dark header
    headerTint: tintColorDark,

    // New additions for dark mode
    subtleBackground: '#161B22',
    primaryCallToActionBackground: tintColorDark,
    primaryCallToActionText: '#E5E5EA', // Ensure contrast
    secondaryCallToActionBackground: '#21262D',
    secondaryCallToActionText: '#E5E5EA',
    disabledText: '#586069',
    gradientStart: '#8A7DFF',
    gradientEnd: '#7A6CEB',
    inputBackground: '#2C2C2E', // For text inputs on dark theme
    inputPlaceholder: '#7E7E82', // For placeholder text in inputs
    switchThumbDisabled: '#424242',
    switchTrackDisabled: '#585858',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;