// labwatch-app/constants/Colors.ts

// --- Primary Brand Colors (Matching Logo) ---
const brandPurple = '#7633FF';        // Deepened Logo Purple (Better AA contrast)
const brandCyan = '#0095FF';          // Enhanced Logo Cyan-Blue (Better contrast)
const brandPurpleDark = '#9966FF';    // Optimized light purple for dark mode
const brandCyanDark = '#4DB8FF';      // Optimized light blue for dark mode

// --- Extended Brand Palette ---
const purpleLight = '#B794FF';        // Softer purple for backgrounds
const purpleUltraLight = '#F5F0FF';   // Improved very light purple for subtle elements
const cyanLight = '#7DD3FF';          // Softer cyan for backgrounds  
const cyanUltraLight = '#EBF8FF';     // Improved very light cyan for subtle elements

// --- Neutral Grays (Modern, high-contrast) ---
const grayDarkest = '#0A0A0B';        // Almost black
const grayDark = '#1C1C1E';           // iOS-style dark gray
const grayMedium = '#48484A';         // Medium gray
const grayLight = '#8E8E93';          // Light gray
const grayLightest = '#F2F2F7';       // Very light gray
const grayWhite = '#FFFFFF';          // Pure white

// --- Accessibility & Interaction Colors ---
const focusRingLight = 'rgba(118, 51, 255, 0.55)';  // Improved focus indicator for light mode
const focusRingDark = 'rgba(153, 102, 255, 0.65)';  // Improved focus indicator for dark mode
const elevationLight = 'rgba(0, 0, 0, 0.08)';       // Enhanced shadow for elevation in light mode
const elevationDark = 'rgba(0, 0, 0, 0.25)';        // Enhanced shadow for elevation in dark mode

export const Colors = {
  light: {
    // --- Core UI Colors ---
    text: grayDarkest,
    background: '#FAFBFC',             // Slightly warmer than pure white
    tint: brandPurple,
    icon: '#6B7280',                   // Balanced gray for icons
    tabIconDefault: '#9CA3AF',
    tabIconSelected: brandPurple,
    
    // --- Card & Surface Colors ---
    cardBackground: grayWhite,
    surfaceSecondary: '#F8FAFC',       // Subtle background variation
    borderColor: '#E5E7EB',
    shadowColor: 'rgba(139, 82, 254, 0.08)', // Subtle purple shadow
      // --- Status Colors ---
    errorText: '#DC2626',              // Higher contrast red for better readability
    warningText: '#D97706',            // Higher contrast amber for better readability
    successText: '#059669',            // Higher contrast green for better readability
    infoText: brandCyan,
    
    // --- Header & Navigation ---
    headerBackground: 'rgba(255, 255, 255, 0.95)', // Slightly transparent
    headerTint: brandPurple,
    headerBorder: 'rgba(229, 231, 235, 0.6)',    // --- Interactive Elements ---
    primaryButton: brandPurple,
    primaryButtonText: grayWhite,
    primaryButtonPressed: '#6028CC',   // Darker purple for pressed state with better contrast
    
    secondaryButton: purpleUltraLight,
    secondaryButtonText: brandPurple,
    secondaryButtonPressed: '#E0D6FF',
    
    // --- Accent & Highlights ---
    accent: brandCyan,
    accentLight: cyanLight,
    accentUltraLight: cyanUltraLight,
    
    // --- Input & Form Elements ---
    inputBackground: grayWhite,
    mutedText: '#8e8e93',     // Added
    inputBorder: '#D1D5DB',
    inputFocusBorder: brandPurple,
    inputPlaceholder: grayLight,
      // --- Gradients ---
    gradientStart: brandCyan,          // Cyan to Purple (matching logo)
    gradientEnd: brandPurple,
    gradientOverlay: 'linear-gradient(135deg, rgba(0, 149, 255, 0.1) 0%, rgba(118, 51, 255, 0.1) 100%)',
    
    // --- Utility Colors ---
    divider: '#F3F4F6',
    disabled: '#D1D5DB',
    disabledText: grayLight,
    overlay: 'rgba(0, 0, 0, 0.4)',
    
    // --- Switch & Toggle Elements ---
    switchTrack: '#E5E7EB',
    switchThumb: grayWhite,
    switchActiveTrack: brandPurple,
    switchDisabledTrack: '#F3F4F6',
    switchDisabledThumb: '#D1D5DB',
  },
  
  dark: {
    // --- Core UI Colors ---
    text: '#F9FAFB',
    background: '#0B0B0D',             // Deep dark with slight purple tint
    tint: brandPurpleDark,
    icon: '#9CA3AF',
    tabIconDefault: '#6B7280',
    tabIconSelected: brandPurpleDark,
    
    // --- Card & Surface Colors ---
    cardBackground: '#1A1B1E',         // Dark card with subtle warmth
    surfaceSecondary: '#131316',       // Darker surface variation
    borderColor: '#374151',
    shadowColor: 'rgba(166, 107, 255, 0.12)', // Subtle purple shadow for dark mode
      // --- Status Colors ---
    errorText: '#F87171',              // Softer red for dark mode
    warningText: '#FBBF24',            // Softer amber
    successText: '#34D399',            // Softer green
    infoText: brandCyanDark,
    
    // --- Header & Navigation ---
    headerBackground: 'rgba(26, 27, 30, 0.95)', // Slightly transparent dark
    headerTint: brandPurpleDark,
    headerBorder: 'rgba(55, 65, 81, 0.6)',    // --- Interactive Elements ---
    primaryButton: brandPurpleDark,
    primaryButtonText: grayDarkest,    // Dark text on light purple for contrast
    primaryButtonPressed: '#B794FF',   // Even lighter for pressed state
    
    secondaryButton: '#2D1B4E',        // Dark purple background
    secondaryButtonText: brandPurpleDark,
    secondaryButtonPressed: '#3D2B5E',
    
    // --- Accent & Highlights ---
    accent: brandCyanDark,
    accentLight: '#7DD3FF',
    accentUltraLight: 'rgba(125, 211, 255, 0.1)',
    
    // --- Input & Form Elements ---
    inputBackground: '#1F2937',
    inputBorder: '#4B5563',
    inputFocusBorder: brandPurpleDark,
    inputPlaceholder: '#9CA3AF',
      // --- Gradients ---
    gradientStart: '#1E3A5F',          // Dark cyan to dark purple
    gradientEnd: '#2D1B4E',
    gradientOverlay: 'linear-gradient(135deg, rgba(77, 184, 255, 0.08) 0%, rgba(153, 102, 255, 0.08) 100%)',
    
    // --- Utility Colors ---
    divider: '#374151',
    disabled: '#4B5563',
    disabledText: '#6B7280',
    overlay: 'rgba(0, 0, 0, 0.7)',
    
    // --- Switch & Toggle Elements ---
    switchTrack: '#4B5563',
    switchThumb: '#F9FAFB',
    switchActiveTrack: brandPurpleDark,
    switchDisabledTrack: '#374151',
    switchDisabledThumb: '#6B7280',
  },
};

// --- Semantic Color Aliases ---
export const SemanticColors = {
  brand: {
    primary: brandPurple,
    secondary: brandCyan,
    primaryDark: brandPurpleDark,
    secondaryDark: brandCyanDark,
  },
  feedback: {
    success: '#059669',
    warning: '#D97706', 
    error: '#DC2626',
    info: brandCyan,
  },
  gradients: {
    brandPrimary: `linear-gradient(135deg, ${brandCyan} 0%, ${brandPurple} 100%)`,
    brandSecondary: `linear-gradient(135deg, ${purpleUltraLight} 0%, ${cyanUltraLight} 100%)`,
    brandDark: `linear-gradient(135deg, #1E3A5F 0%, #2D1B4E 100%)`,
  }
};

export type ColorScheme = keyof typeof Colors;
export type ColorName = keyof typeof Colors.light & keyof typeof Colors.dark;