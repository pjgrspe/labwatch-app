// app/more/settings.tsx
import Card from '@/components/Card';
import ListItem from '@/components/ListItem';
import { Text as ThemedText } from '@/components/Themed'; // Using themed Text
import { useThemeColor } from '@/hooks/useThemeColor'; // For direct color usage
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';


export default function SettingsScreen() {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false); // This might be controlled by useColorScheme in a real app

  const containerBackgroundColor = useThemeColor({}, 'background');
  const headerTextColor = useThemeColor({ light: '#444', dark: '#ccc' }, 'text'); // Example
  const settingTextColor = useThemeColor({}, 'text');
  const switchThumbColorEnabled = useThemeColor({light: "#f5dd4b", dark: "#f5dd4b"}, 'tint'); // Example: using tint or specific color
  const switchTrackColorTrue = useThemeColor({ light: "#81b0ff", dark: "#585858" }, 'tint');
  const switchTrackColorFalse = useThemeColor({ light: "#767577", dark: "#3e3e3e" }, 'icon'); // Example
  const switchIosBackgroundColor = useThemeColor({light: "#3e3e3e", dark: "#1c1c1e"}, 'background');


  return (
    <ScrollView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ThemedText style={[styles.header, { color: headerTextColor }]}>Notification Settings</ThemedText>
      <Card>
        <View style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Enable Push Notifications</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={pushNotificationsEnabled ? switchThumbColorEnabled : useThemeColor({light: "#f4f3f4", dark: "#767577"}, 'icon')}
            ios_backgroundColor={switchIosBackgroundColor}
            onValueChange={() => setPushNotificationsEnabled(previousState => !previousState)}
            value={pushNotificationsEnabled}
          />
        </View>
        <View style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Enable Email Notifications</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={emailNotificationsEnabled ? switchThumbColorEnabled : useThemeColor({light: "#f4f3f4", dark: "#767577"}, 'icon')}
            ios_backgroundColor={switchIosBackgroundColor}
            onValueChange={() => setEmailNotificationsEnabled(previousState => !previousState)}
            value={emailNotificationsEnabled}
          />
        </View>
      </Card>

      <ThemedText style={[styles.header, { color: headerTextColor }]}>Appearance</ThemedText>
      <Card>
        <View style={styles.settingItem}>
          <ThemedText style={[styles.settingText, { color: settingTextColor }]}>Enable Dark Mode</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={darkModeEnabled ? switchThumbColorEnabled : useThemeColor({light: "#f4f3f4", dark: "#767577"}, 'icon')}
            ios_backgroundColor={switchIosBackgroundColor}
            onValueChange={() => setDarkModeEnabled(previousState => !previousState)}
            value={darkModeEnabled}
            // Note: Actual dark mode switching usually involves changing the theme at a higher level (e.g., in RootLayout)
          />
        </View>
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
    paddingVertical: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2, // Card component handles its own padding
    // Border is now handled by ListItem or removed if Card implies separation
  },
  settingText: {
    fontSize: 16,
  },
});