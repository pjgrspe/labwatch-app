// labwatch-app/constants/Colors.ts
const tintColorLight = '#007AFF';
const tintColorDark = '#FFFFFF';

export const Colors = {
  light: {
    text: '#000000',
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#CCCCCC',
    tabIconSelected: tintColorLight,
    cardBackground: '#FFFFFF',
    borderColor: '#DDDDDD',
    errorText: '#FF3B30',
    warningText: '#FF9500',
    successText: '#34C759',
    infoText: '#007AFF',
    headerBackground: '#F8F8F8',
    headerTint: '#007AFF',
    // Add any new shared colors here
    // Example:
    // buttonBackground: '#007AFF',
    // buttonText: '#FFFFFF',
    // destructiveButtonBackground: '#FF3B30',
    // destructiveButtonText: '#FFFFFF',
    // listSeparator: '#DDDDDD',
    // inputBackground: '#EEEEEE',
    // inputBorder: '#CCCCCC',
    // placeholderText: '#999999',
  },
  dark: {
    text: '#FFFFFF',
    background: '#1C1C1E',
    tint: tintColorDark,
    icon: '#98989D',
    tabIconDefault: '#757575',
    tabIconSelected: tintColorDark,
    cardBackground: '#2C2C2E',
    borderColor: '#3A3A3C',
    errorText: '#FF453A',
    warningText: '#FF9F0A',
    successText: '#30D158',
    infoText: '#0A84FF',
    headerBackground: '#1C1C1E',
    headerTint: '#FFFFFF',
    // Add any new shared colors here
    // Example:
    // buttonBackground: '#FFFFFF',
    // buttonText: '#000000',
    // destructiveButtonBackground: '#FF453A',
    // destructiveButtonText: '#FFFFFF',
    // listSeparator: '#3A3A3C',
    // inputBackground: '#2C2C2E',
    // inputBorder: '#3A3A3C',
    // placeholderText: '#777777',
  },
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;