// app/more/settings.tsx
import Card from '@/components/Card';
import ListItem from '@/components/ListItem';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

export default function SettingsScreen() {
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(true);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(false);
  const [darkModeEnabled, setDarkModeEnabled] = useState(false);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Notification Settings</Text>
      <Card>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Enable Push Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={pushNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setPushNotificationsEnabled(previousState => !previousState)}
            value={pushNotificationsEnabled}
          />
        </View>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Enable Email Notifications</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#81b0ff" }}
            thumbColor={emailNotificationsEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setEmailNotificationsEnabled(previousState => !previousState)}
            value={emailNotificationsEnabled}
          />
        </View>
      </Card>

      <Text style={styles.header}>Appearance</Text>
      <Card>
        <View style={styles.settingItem}>
          <Text style={styles.settingText}>Enable Dark Mode</Text>
          <Switch
            trackColor={{ false: "#767577", true: "#585858" }}
            thumbColor={darkModeEnabled ? "#f5dd4b" : "#f4f3f4"}
            ios_backgroundColor="#3e3e3e"
            onValueChange={() => setDarkModeEnabled(previousState => !previousState)}
            value={darkModeEnabled}
          />
        </View>
      </Card>

      <Text style={styles.header}>Account</Text>
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
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    color: '#444',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 2, // Padding is within the card
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e0e0e0',
  },
  settingText: {
    fontSize: 16,
  },
});