// labwatch-app/hooks/useThemeColor.ts
import { ColorName, Colors, ColorScheme } from '@/constants';
import { useColorScheme as useNativeColorScheme } from 'react-native'; // Renamed to avoid conflict

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: ColorName
): string {
  const theme: ColorScheme = useNativeColorScheme() ?? 'light';
  const colorFromProps = props[theme];

  if (colorFromProps) {
    return colorFromProps;
  } else {
    return Colors[theme][colorName];
  }
}

// It's also useful to have a hook that just returns the current theme string
export function useCurrentTheme(): ColorScheme {
  return useNativeColorScheme() ?? 'light';
}