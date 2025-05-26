// labwatch-app/constants/Colors.ts

// --- Primary App Colors ---
const primaryPurple = '#8B52FE';
const primaryBlue = '#38B5FE';

// --- Theme Tints (Derived from Primary Purple) ---
const tintColorLight = primaryPurple; // Main App Purple: #8B52FE
const tintColorDark = '#9C6BFF';      // Lighter Purple for Dark Mode Contrast (Derived from #8B52FE)

// --- Accent Blues (Derived from Primary Blue) ---
const blueAccentLight = primaryBlue;      // Main App Blue: #38B5FE
const blueAccentDark = '#63C6FF';     // Lighter Blue for Dark Mode (Derived from #38B5FE)

export const Colors = {
  light: {
    text: '#1C1C1E',
    background: '#F4F5F7',
    tint: tintColorLight,
    icon: '#6E7781',
    tabIconDefault: '#AEB3B9',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    borderColor: '#E5E5EA',
    errorText: '#FF3B30',
    warningText: '#FF9500',
    successText: '#34C759',
    infoText: blueAccentLight, // Using Main App Blue
    headerBackground: '#FFFFFF',
    headerTint: tintColorLight,

    subtleBackground: '#F9FAFB',
    primaryCallToActionBackground: tintColorLight,
    primaryCallToActionText: '#FFFFFF', // NOTE: Contrast #8B52FE on #FFFFFF is ~2.4:1 (Low - consider larger font or darker purple if WCAG AA is needed)
    secondaryCallToActionBackground: '#E5E5EA',
    secondaryCallToActionText: '#1C1C1E',
    disabledText: '#AEB3B9',
    gradientStart: blueAccentLight, // Blue to Purple Gradient
    gradientEnd: tintColorLight,
    inputBackground: '#FFFFFF',
    inputPlaceholder: '#9A9A9E',
    switchThumbDisabled: '#BDBDBD',
    switchTrackDisabled: '#E0E0E0',
  },
  dark: {
    text: '#E5E5EA',
    background: '#0D1117', // Dark charcoal
    tint: tintColorDark,
    icon: '#8A949F',
    tabIconDefault: '#586069',
    tabIconSelected: tintColorDark,
    cardBackground: '#1A1F2A',
    borderColor: '#30363D',
    errorText: '#FF6B6B',
    warningText: '#FFAA5C',
    successText: '#56D364',
    infoText: blueAccentDark, // Using Lighter App Blue
    headerBackground: '#161B22',
    headerTint: tintColorDark,

    subtleBackground: '#161B22',
    primaryCallToActionBackground: tintColorDark,
    primaryCallToActionText: '#1C1C1E', // Dark text (#1C1C1E) on Lighter Purple (#9C6BFF) for good contrast (~9.7:1)
    secondaryCallToActionBackground: '#21262D',
    secondaryCallToActionText: '#E5E5EA',
    disabledText: '#586069',
    gradientStart: blueAccentDark, // Lighter Blue to Lighter Purple Gradient
    gradientEnd: tintColorDark,
    inputBackground: '#2C2C2E',
    inputPlaceholder: '#7E7E82',
    switchThumbDisabled: '#424242',
    switchTrackDisabled: '#585858',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;