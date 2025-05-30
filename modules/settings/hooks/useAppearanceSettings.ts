import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { Appearance } from 'react-native';

const THEME_PREFERENCE_KEY = '@theme_preference'; // 'light', 'dark', or 'system'

export type ThemePreference = 'light' | 'dark' | 'system';

export function useAppearanceSettings() {
  const [themePreference, setThemePreference] = useState<ThemePreference>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_PREFERENCE_KEY) as ThemePreference | null;
        if (storedPreference) {
          setThemePreference(storedPreference);
          if (storedPreference !== 'system') {
            Appearance.setColorScheme(storedPreference);
          } else {
            Appearance.setColorScheme(null); // Resets to system default
          }
        }
      } catch (e) {
        console.error('Failed to load theme preference.', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemePreference();
  }, []);

  const updateThemePreference = async (preference: ThemePreference) => {
    setThemePreference(preference);
    try {
      await AsyncStorage.setItem(THEME_PREFERENCE_KEY, preference);
      if (preference !== 'system') {
        Appearance.setColorScheme(preference);
      } else {
        Appearance.setColorScheme(null); // Resets to system default
      }
      console.log('Theme preference updated to:', preference);
    } catch (e) {
      console.error('Failed to save theme preference.', e);
    }
  };

  // This hook will determine the currently active scheme based on preference and system
  const currentColorScheme = Appearance.getColorScheme();
  const isDarkModeActive = themePreference === 'dark' || (themePreference === 'system' && currentColorScheme === 'dark');


  return {
    themePreference,
    isDarkModeActive, // This reflects the actual active state
    updateThemePreference,
    isLoadingAppearanceSettings: isLoading,
  };
}