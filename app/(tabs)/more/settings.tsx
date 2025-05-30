// app/(tabs)/more/settings.tsx
import { Card, ListItem, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { ThemePreference, useAppearanceSettings } from '@/modules/settings/hooks/useAppearanceSettings';
import { useNotificationSettings } from '@/modules/settings/hooks/useNotificationSettings';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { 
  ActivityIndicator, 
  Appearance, 
  Pressable, 
  ScrollView, 
  StyleSheet, 
  Switch,
  TouchableOpacity,
  Alert,
  View,
  Text,
  RefreshControl,
  Platform
} from 'react-native';

// Define interfaces for settings data
interface SecuritySettings {
  biometricEnabled: boolean;
  autoLockTime: number;
  requirePasswordForSensitiveActions: boolean;
  lastPasswordChange: Date;
}

interface PrivacySettings {
  shareUsageData: boolean;
  shareLocationData: boolean;
  allowThirdPartyIntegrations: boolean;
  dataRetentionPeriod: number;
}

interface GeneralSettings {
  language: string;
  timezone: string;
  dateFormat: string;
  measurementUnit: 'metric' | 'imperial';
}

interface LabSettings {
  defaultLabLocation: string;
  autoCheckIn: boolean;
  reminderNotifications: boolean;
  equipmentNotifications: boolean;
}

export default function SettingsScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  
  // Mock data for additional settings
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    biometricEnabled: true,
    autoLockTime: 300, // 5 minutes
    requirePasswordForSensitiveActions: true,
    lastPasswordChange: new Date('2024-10-15')
  });

  const [privacySettings, setPrivacySettings] = useState<PrivacySettings>({
    shareUsageData: false,
    shareLocationData: true,
    allowThirdPartyIntegrations: false,
    dataRetentionPeriod: 365 // days
  });

  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>({
    language: 'English',
    timezone: 'UTC+8',
    dateFormat: 'MM/DD/YYYY',
    measurementUnit: 'metric'
  });

  const [labSettings, setLabSettings] = useState<LabSettings>({
    defaultLabLocation: 'Main Laboratory',
    autoCheckIn: true,
    reminderNotifications: true,
    equipmentNotifications: true
  });

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
  const inactiveThemeButtonTextColor = settingTextColor;  const activeLightButtonSpecificTintColor = useThemeColor({light: '#007AFF', dark: '#FFFFFF'}, 'tint'); // Moved hook call here
  // --- End of Hook Declarations ---

  // Handle refresh
  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call to refresh settings
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  // Security setting handlers
  const toggleBiometric = () => {
    if (securitySettings.biometricEnabled) {
      Alert.alert(
        'Disable Biometric Authentication',
        'Are you sure you want to disable biometric authentication? You will need to use your password to access the app.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Disable', 
            style: 'destructive',
            onPress: () => setSecuritySettings(prev => ({ ...prev, biometricEnabled: false }))
          }
        ]
      );
    } else {
      setSecuritySettings(prev => ({ ...prev, biometricEnabled: true }));
    }
  };

  const togglePasswordRequired = () => {
    setSecuritySettings(prev => ({ 
      ...prev, 
      requirePasswordForSensitiveActions: !prev.requirePasswordForSensitiveActions 
    }));
  };

  // Privacy setting handlers
  const toggleUsageData = () => {
    setPrivacySettings(prev => ({ ...prev, shareUsageData: !prev.shareUsageData }));
  };

  const toggleLocationData = () => {
    setPrivacySettings(prev => ({ ...prev, shareLocationData: !prev.shareLocationData }));
  };

  const toggleThirdPartyIntegrations = () => {
    setPrivacySettings(prev => ({ 
      ...prev, 
      allowThirdPartyIntegrations: !prev.allowThirdPartyIntegrations 
    }));
  };

  // Lab setting handlers
  const toggleAutoCheckIn = () => {
    setLabSettings(prev => ({ ...prev, autoCheckIn: !prev.autoCheckIn }));
  };

  const toggleReminderNotifications = () => {
    setLabSettings(prev => ({ ...prev, reminderNotifications: !prev.reminderNotifications }));
  };

  const toggleEquipmentNotifications = () => {
    setLabSettings(prev => ({ ...prev, equipmentNotifications: !prev.equipmentNotifications }));
  };

  // Navigation handlers
  const handleDataExport = () => {
    Alert.alert(
      'Export Data',
      'This will create a downloadable file containing your lab data. This may take a few minutes.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Export', 
          onPress: () => {
            Alert.alert('Export Started', 'You will be notified when your data export is ready for download.');
          }
        }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            Alert.alert('Account Deletion', 'Please contact your administrator to delete your account.');
          }
        }
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',          onPress: () => {
            // Implement logout logic
            router.replace('/');
          }
        }
      ]
    );
  };

  const getDaysUntilPasswordExpiry = () => {
    const daysSinceChange = Math.floor((new Date().getTime() - securitySettings.lastPasswordChange.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, 90 - daysSinceChange); // Assuming 90-day password policy
  };

  if (isLoadingNotificationSettings || isLoadingAppearanceSettings) {
    // Now it's safe to return early because all hooks have been called
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
      </ThemedView>
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Settings',
          headerStyle: {
            backgroundColor: containerBackgroundColor,
          },
          headerTintColor: headerTextColor,
          headerTitleStyle: {
            fontFamily: 'Montserrat_600SemiBold',
            fontSize: Layout.fontSize.lg,
          },
        }}
      />
      <ScrollView 
        style={[styles.container, { backgroundColor: containerBackgroundColor }]} 
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[activityIndicatorColor]}
            tintColor={activityIndicatorColor}
          />
        }
      >
        {/* Notifications Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Notifications
        </ThemedText>
        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Push Notifications
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Receive alerts about lab activities
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={pushNotificationsEnabled ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={togglePushNotifications}
              value={pushNotificationsEnabled}
            />
          </View>
          
          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Email Notifications
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Receive email updates and reports
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={emailNotificationsEnabled ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleEmailNotifications}
              value={emailNotificationsEnabled}
            />
          </View>

          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Reminder Notifications
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Get reminders for lab sessions and tasks
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={labSettings.reminderNotifications ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleReminderNotifications}
              value={labSettings.reminderNotifications}
            />
          </View>

          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Equipment Alerts
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Notifications about equipment status
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={labSettings.equipmentNotifications ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleEquipmentNotifications}
              value={labSettings.equipmentNotifications}
            />
          </View>
        </Card>

        {/* Appearance Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Appearance
        </ThemedText>
        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Theme
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Choose your preferred color scheme
              </ThemedText>
            </View>
            <View style={styles.themeButtonsContainer}>
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
                    <ThemedText style={[styles.themeButtonText, { color: buttonTextColor }]}>
                      {pref.charAt(0).toUpperCase() + pref.slice(1)}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Card>

        {/* Security Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Security
        </ThemedText>
        <Card style={styles.card}>
          {Platform.OS !== 'web' && (
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Biometric Authentication
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Use fingerprint or face recognition
                </ThemedText>
              </View>
              <Switch
                trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
                thumbColor={securitySettings.biometricEnabled ? switchThumbColorEnabled : switchThumbColorDisabled}
                ios_backgroundColor={switchIosBackgroundColor}
                onValueChange={toggleBiometric}
                value={securitySettings.biometricEnabled}
              />
            </View>
          )}

          <View style={[styles.settingItem, Platform.OS !== 'web' && styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Require Password for Sensitive Actions
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Additional verification for important operations
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={securitySettings.requirePasswordForSensitiveActions ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={togglePasswordRequired}
              value={securitySettings.requirePasswordForSensitiveActions}
            />
          </View>          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Change Password', 'This feature will be available in a future update.')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Change Password
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Password expires in {getDaysUntilPasswordExpiry()} days
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Auto-Lock Settings', 'Auto-lock time can be set to 1, 5, 15, or 30 minutes.')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Auto-Lock
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Currently: {securitySettings.autoLockTime / 60} minutes
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Privacy Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Privacy & Data
        </ThemedText>
        <Card style={styles.card}>
          <View style={styles.settingItem}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Share Usage Data
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Help improve the app with anonymous usage data
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={privacySettings.shareUsageData ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleUsageData}
              value={privacySettings.shareUsageData}
            />
          </View>

          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Share Location Data
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Allow location tracking for lab check-ins
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={privacySettings.shareLocationData ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleLocationData}
              value={privacySettings.shareLocationData}
            />
          </View>

          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Third-Party Integrations
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Allow external apps to access your data
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={privacySettings.allowThirdPartyIntegrations ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleThirdPartyIntegrations}
              value={privacySettings.allowThirdPartyIntegrations}
            />
          </View>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={handleDataExport}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Export Data
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Download your lab data
                </ThemedText>
              </View>
              <Ionicons name="download-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Privacy Policy', 'Our privacy policy ensures your data is protected and used responsibly.')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Privacy Policy
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Review our privacy practices
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Lab Settings Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Lab Preferences
        </ThemedText>
        <Card style={styles.card}>          <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('Lab Locations', 'Available locations: Main Laboratory, Research Lab A, Research Lab B, Chemistry Lab')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Default Lab Location
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  {labSettings.defaultLabLocation}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>

          <View style={[styles.settingItem, styles.borderTop]}>
            <View style={styles.settingInfo}>
              <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                Auto Check-in
              </ThemedText>
              <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                Automatically check in when entering lab
              </ThemedText>
            </View>
            <Switch
              trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
              thumbColor={labSettings.autoCheckIn ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchIosBackgroundColor}
              onValueChange={toggleAutoCheckIn}
              value={labSettings.autoCheckIn}
            />
          </View>          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Language & Region', 'Language: English, Chinese, Spanish\nTimezone: UTC+8 (Asia/Manila)\nDate Format: MM/DD/YYYY, DD/MM/YYYY')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Language & Region
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  {generalSettings.language}, {generalSettings.timezone}
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* Account Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          Account
        </ThemedText>
        <Card style={styles.card}>
          <TouchableOpacity style={styles.listItem} onPress={() => router.push('/profile')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Edit Profile
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Update your profile information
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Account Management', 'Manage your subscription, billing, and account preferences.')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Account Management
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Manage your account settings
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={handleDeleteAccount}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: '#ff4444' }]}>
                  Delete Account
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Permanently delete your account
                </ThemedText>
              </View>
              <Ionicons name="trash-outline" size={20} color="#ff4444" />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={handleLogout}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Logout
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Sign out of your account
                </ThemedText>
              </View>
              <Ionicons name="log-out-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>
        </Card>

        {/* App Info Section */}
        <ThemedText style={[styles.sectionHeader, { color: headerTextColor }]}>
          About
        </ThemedText>
        <Card style={styles.card}>          <TouchableOpacity style={styles.listItem} onPress={() => Alert.alert('About LabWatch', 'LabWatch v1.0.0\n\nA comprehensive laboratory management system designed for safety, efficiency, and compliance.\n\nDeveloped by: AUF Research Team\nCopyright © 2025')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  About LabWatch
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Version 1.0.0
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Help & Support', 'For technical support:\n• Email: support@labwatch.edu\n• Phone: +63 (2) 8123-4567\n• Documentation: Available in app\n• Emergency: Contact your lab supervisor')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Help & Support
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Get help and contact support
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.listItem, styles.borderTop]} onPress={() => Alert.alert('Terms of Service', 'By using LabWatch, you agree to:\n• Follow all laboratory safety protocols\n• Use the system responsibly\n• Report any issues promptly\n• Maintain data confidentiality\n\nFull terms available in your institution\'s documentation.')}>
            <View style={styles.listItemContent}>
              <View style={styles.listItemInfo}>
                <ThemedText style={[styles.settingTitle, { color: settingTextColor }]}>
                  Terms of Service
                </ThemedText>
                <ThemedText style={[styles.settingDescription, { color: hintTextColor }]}>
                  Review terms and conditions
                </ThemedText>
              </View>
              <Ionicons name="chevron-forward-outline" size={20} color={hintTextColor} />
            </View>
          </TouchableOpacity>
        </Card>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: Layout.spacing.xl,
  },
  sectionHeader: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat_600SemiBold',
    paddingHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  card: {
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  settingInfo: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  settingTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat_500Medium',
    marginBottom: Layout.spacing.xs,
  },
  settingDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat_400Regular',
    lineHeight: Layout.fontSize.sm * 1.3,
  },
  themeButtonsContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  themeButton: {
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
    marginLeft: Layout.spacing.xs,
    minWidth: 60,
    alignItems: 'center',
  },
  themeButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat_500Medium',
  },
  listItem: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  listItemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  listItemInfo: {
    flex: 1,
    marginRight: Layout.spacing.md,
  },
  borderTop: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  header: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat_600SemiBold',
    paddingHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
    marginBottom: Layout.spacing.sm,
  },
  settingText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat_500Medium',
    flexShrink: 1,
    marginRight: Layout.spacing.sm,
  },
  hintText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat_400Regular',
    paddingHorizontal: Layout.spacing.md,
    marginTop: Layout.spacing.xs,
  },
});