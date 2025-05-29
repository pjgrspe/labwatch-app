// app/(tabs)/more/settings.tsx
import { Card, ListItem, ThemedText, ThemedView } from '@/components';
import { useThemeColor } from '@/hooks';
import { ThemePreference, useAppearanceSettings } from '@/modules/settings/hooks/useAppearanceSettings';
import { useNotificationSettings } from '@/modules/settings/hooks/useNotificationSettings';
import React from 'react';
import { ActivityIndicator, Appearance, Pressable, ScrollView, StyleSheet, Switch } from 'react-native';

export default function SettingsScreen() {
  // --- Start of Hook Declarations (ALL HOOKS MOVED HERE) ---
  const {
    pushNotificationsEnabled,
    emailNotificationsEnabled,
    togglePushNotifications,
    toggleEmailNotifications,
    isLoadingNotificationSettings,
  } = useNotificationSettings();

  const {
    themePreference,
    isDarkModeActive,
    updateThemePreference,
    isLoadingAppearanceSettings,
  } = useAppearanceSettings();

  // Define ALL theme colors at the top level
  const containerBackgroundColor = useThemeColor({}, 'background');
  const headerTextColor = useThemeColor({ light: '#444', dark: '#ccc' }, 'text');
  const settingTextColor = useThemeColor({}, 'text');
  const switchThumbColorEnabled = useThemeColor({ light: "#f5dd4b", dark: "#f5dd4b" }, 'tint');
  const switchThumbColorDisabled = useThemeColor({ light: "#f4f3f4", dark: "#767577" }, 'icon');
  const switchTrackColorTrue = useThemeColor({ light: "#81b0ff", dark: "#585858" }, 'tint');
  const switchTrackColorFalse = useThemeColor({ light: "#767577", dark: "#3e3e3e" }, 'icon');
  const switchIosBackgroundColor = useThemeColor({ light: "#3e3e3e", dark: "#1c1c1e" }, 'background');
  const activeThemeButtonBorderColor = useThemeColor({}, 'tint');
  const inactiveThemeButtonBorderColor = useThemeColor({}, 'borderColor');
  const activityIndicatorColor = useThemeColor({}, 'tint');
  const hintTextColor = useThemeColor({}, 'icon');
  const activeThemeButtonTextColorLight = useThemeColor({light: '#FFFFFF', dark: '#000000'}, 'background');
  const activeThemeButtonTextColorDark = useThemeColor({light: '#FFFFFF', dark: '#FFFFFF'}, 'text');
  const inactiveThemeButtonTextColor = settingTextColor;
  const activeLightButtonSpecificTintColor = useThemeColor({light: '#007AFF', dark: '#FFFFFF'}, 'tint'); // Moved hook call here
  // --- End of Hook Declarations ---

  if (isLoadingNotificationSettings || isLoadingAppearanceSettings) {
    // Now it's safe to return early because all hooks have been called
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
      </ThemedView>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]} contentContainerStyle={styles.contentContainer}>
      <ThemedText style={[styles.header, { color: headerTextColor }]}>Notification Settings</ThemedText>
      <Card>
        <ThemedView style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Enable Push Notifications</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={pushNotificationsEnabled ? switchThumbColorEnabled : switchThumbColorDisabled}
            ios_backgroundColor={switchIosBackgroundColor}
            onValueChange={togglePushNotifications}
            value={pushNotificationsEnabled}
          />
        </ThemedView>
        <ThemedView style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Enable Email Notifications</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={emailNotificationsEnabled ? switchThumbColorEnabled : switchThumbColorDisabled}
            ios_backgroundColor={switchIosBackgroundColor}
            onValueChange={toggleEmailNotifications}
            value={emailNotificationsEnabled}
          />
        </ThemedView>
      </Card>

      <ThemedText style={[styles.header, { color: headerTextColor }]}>Appearance</ThemedText>
      <Card>
        <ThemedView style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Theme</ThemedText>
          <ThemedView style={styles.themeButtonsContainer}>
            {(['light', 'dark', 'system'] as ThemePreference[]).map((pref) => {
              const isActive = themePreference === pref;
              let buttonTextColor = inactiveThemeButtonTextColor;
              if (isActive) {
                if (pref === 'light') {
                    buttonTextColor = activeThemeButtonBorderColor === activeLightButtonSpecificTintColor && Appearance.getColorScheme() === 'light' ? activeThemeButtonTextColorLight : activeThemeButtonTextColorDark;
                } else {
                    buttonTextColor = activeThemeButtonTextColorDark;
                }
              }

              return (
                <Pressable
                  key={pref}
                  style={[
                    styles.themeButton,
                    { borderColor: isActive ? activeThemeButtonBorderColor : inactiveThemeButtonBorderColor },
                    { backgroundColor: isActive ? activeThemeButtonBorderColor : 'transparent' }
                  ]}
                  onPress={() => updateThemePreference(pref)}
                >
                  <ThemedText style={{ color: buttonTextColor }}>
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </ThemedText>
                </Pressable>
              );
            })}
          </ThemedView>
        </ThemedView>
      </Card>

      <ThemedText style={[styles.header, { color: headerTextColor }]}>Account</ThemedText>
      <Card>
        <ListItem title="Edit Profile" onPress={() => { /* Navigate to profile edit */ }} rightIconName="chevron-forward-outline" />
        <ListItem title="Change Password" onPress={() => { /* Navigate to change password */ }} rightIconName="chevron-forward-outline" />
        <ListItem title="Logout" onPress={() => { /* Handle logout */ }} rightIconName="log-out-outline" style={{ borderBottomWidth: 0 }}/>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2, // Reduced from original to match ListItem more closely if desired
    backgroundColor: 'transparent', // Ensure this if Card has its own background
  },
  settingText: {
    fontSize: 16,
    flexShrink: 1,
    marginRight: 8,
  },
  themeButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent', // Ensure this if Card has its own background
  },
  themeButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginLeft: 8,
  },
   hintText: {
    fontSize: 12,
    paddingHorizontal: 2, // Match settingItem's horizontal padding
    marginTop: 4,
  },
});