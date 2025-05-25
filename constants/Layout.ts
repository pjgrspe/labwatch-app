// labwatch-app/constants/Layout.ts
import { Dimensions } from 'react-native';

const width = Dimensions.get('window').width;
const height = Dimensions.get('window').height;

export default {
  window: {
    width,
    height,
  },
  isSmallDevice: width < 375,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24, // Slightly increased for more generous spacing
    xl: 32,
    xxl: 40, // New larger spacing
  },
  borderRadius: {
    sm: 6,  // Softer rounding
    md: 12, // More pronounced rounding for cards
    lg: 20, // For larger elements or fully rounded items
    pill: 999, // For pill-shaped buttons
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16, // Standard body text
    lg: 18, // Subheadings or important text
    xl: 22, // Section titles
    xxl: 28, // Main screen titles
    header: 20, // Specific for headers if needed
  },
  fontWeight: {
    light: '300' as '300', // Added 'as const' equivalent for type safety
    normal: '400' as '400',
    medium: '500' as '500', // Good for emphasis
    semibold: '600' as '600', // For titles
    bold: '700' as '700',
  },
  cardShadow: { // General shadow for light theme cards
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08, // Softer shadow
    shadowRadius: 12,    // More diffused
    elevation: 5,
  },
  darkCardShadow: { // Subtle shadow for dark theme cards
    shadowColor: '#000000', // Shadow color can remain black for dark themes too
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, // Dark mode shadows often need to be slightly more opaque to be visible on dark bgs
    shadowRadius: 8,
    elevation: 5, // Elevation can be similar or slightly less
  }
};