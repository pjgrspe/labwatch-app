// app/(tabs)/more/admin/config.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity } from 'react-native';

interface ConfigSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  settings: ConfigSetting[];
}

interface ConfigSetting {
  id: string;
  label: string;
  description: string;
  type: 'boolean' | 'number' | 'text';
  value: any;
  unit?: string;
  min?: number;
  max?: number;
}

export default function SystemConfigScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const [hasChanges, setHasChanges] = useState(false);
  const [configSections, setConfigSections] = useState<ConfigSection[]>([
    {
      title: 'Alert Thresholds',
      icon: 'notifications-outline',
      settings: [
        {
          id: 'temp_warning',
          label: 'Temperature Warning',
          description: 'Temperature threshold for warning alerts',
          type: 'number',
          value: 25,
          unit: '°C',
          min: 15,
          max: 40,
        },
        {
          id: 'temp_critical',
          label: 'Temperature Critical',
          description: 'Temperature threshold for critical alerts',
          type: 'number',
          value: 30,
          unit: '°C',
          min: 20,
          max: 50,
        },
        {
          id: 'humidity_warning',
          label: 'Humidity Warning',
          description: 'Humidity threshold for warning alerts',
          type: 'number',
          value: 70,
          unit: '%',
          min: 40,
          max: 90,
        },
        {
          id: 'gas_detection',
          label: 'Gas Detection Enabled',
          description: 'Enable automatic gas leak detection',
          type: 'boolean',
          value: true,
        },
      ],
    },
    {
      title: 'System Behavior',
      icon: 'settings-outline',
      settings: [
        {
          id: 'auto_alerts',
          label: 'Automatic Alerts',
          description: 'Send alerts automatically when thresholds are exceeded',
          type: 'boolean',
          value: true,
        },
        {
          id: 'data_retention',
          label: 'Data Retention Period',
          description: 'Number of days to keep sensor data',
          type: 'number',
          value: 90,
          unit: 'days',
          min: 30,
          max: 365,
        },
        {
          id: 'notification_cooldown',
          label: 'Notification Cooldown',
          description: 'Minimum time between duplicate notifications',
          type: 'number',
          value: 5,
          unit: 'minutes',
          min: 1,
          max: 60,
        },
      ],
    },
    {
      title: 'Network & Connectivity',
      icon: 'wifi-outline',
      settings: [
        {
          id: 'sensor_timeout',
          label: 'Sensor Timeout',
          description: 'Time before marking a sensor as offline',
          type: 'number',
          value: 30,
          unit: 'seconds',
          min: 10,
          max: 300,
        },
        {
          id: 'auto_reconnect',
          label: 'Auto Reconnect',
          description: 'Automatically reconnect to offline sensors',
          type: 'boolean',
          value: true,
        },
        {
          id: 'backup_server',
          label: 'Backup Server URL',
          description: 'Fallback server for data redundancy',
          type: 'text',
          value: 'backup.labwatch.com',
        },
      ],
    },
  ]);

  const updateSetting = (sectionIndex: number, settingId: string, newValue: any) => {
    setConfigSections(prev => {
      const updated = [...prev];
      const setting = updated[sectionIndex].settings.find(s => s.id === settingId);
      if (setting) {
        setting.value = newValue;
        setHasChanges(true);
      }
      return updated;
    });
  };

  const handleSave = async () => {
    try {
      // Simulate API call to save configuration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert(
        'Configuration Saved',
        'System configuration has been updated successfully.',
        [{ text: 'OK' }]
      );
      
      setHasChanges(false);
    } catch (error) {
      Alert.alert('Save Failed', 'Unable to save configuration. Please try again.');
    }
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all settings to their default values? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            // Reset to default values
            setHasChanges(true);
            Alert.alert('Reset Complete', 'All settings have been reset to default values.');
          }
        }
      ]
    );
  };

  const renderSetting = (setting: ConfigSetting, sectionIndex: number) => {
    switch (setting.type) {
      case 'boolean':
        return (
          <Switch
            value={setting.value}
            onValueChange={(value) => updateSetting(sectionIndex, setting.id, value)}
            trackColor={{ false: borderColor, true: tintColor + '30' }}
            thumbColor={setting.value ? tintColor : '#f4f3f4'}
          />
        );
      
      case 'number':
        return (
          <ThemedView style={styles.numberInputContainer}>
            <TextInput
              style={[
                styles.numberInput,
                { 
                  backgroundColor: cardBackground,
                  borderColor: borderColor,
                  color: textColor,
                }
              ]}
              value={setting.value.toString()}
              onChangeText={(text) => {
                const num = parseInt(text) || 0;
                const clampedValue = Math.max(setting.min || 0, Math.min(setting.max || 999, num));
                updateSetting(sectionIndex, setting.id, clampedValue);
              }}
              keyboardType="numeric"
            />
            {setting.unit && (
              <ThemedText style={[styles.unitText, { color: subtitleColor }]}>
                {setting.unit}
              </ThemedText>
            )}
          </ThemedView>
        );
      
      case 'text':
        return (
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: cardBackground,
                borderColor: borderColor,
                color: textColor,
              }
            ]}
            value={setting.value}
            onChangeText={(text) => updateSetting(sectionIndex, setting.id, text)}
            placeholder={setting.description}
            placeholderTextColor={subtitleColor}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'System Configuration',
          headerRight: () => hasChanges ? (
            <TouchableOpacity onPress={handleSave}>
              <ThemedText style={{ color: tintColor, fontFamily: 'Montserrat-SemiBold' }}>
                Save
              </ThemedText>
            </TouchableOpacity>
          ) : null
        }} 
      />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <ThemedView style={styles.headerContent}>
            <ThemedView style={[styles.headerIconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name="construct-outline" size={32} color={tintColor} />
            </ThemedView>
            <ThemedView style={styles.headerText}>
              <ThemedText style={[styles.headerTitle, { color: textColor }]}>
                System Configuration
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: subtitleColor }]}>
                Configure global system settings and thresholds
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Configuration Sections */}
        {configSections.map((section, sectionIndex) => (
          <Card key={section.title} style={styles.sectionCard}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedView style={[styles.sectionIconContainer, { backgroundColor: tintColor + '15' }]}>
                <Ionicons name={section.icon} size={20} color={tintColor} />
              </ThemedView>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {section.title}
              </ThemedText>
            </ThemedView>

            {section.settings.map((setting, settingIndex) => (
              <ThemedView 
                key={setting.id}
                style={[
                  styles.settingRow,
                  settingIndex < section.settings.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  }
                ]}
              >
                <ThemedView style={styles.settingContent}>
                  <ThemedText style={[styles.settingLabel, { color: textColor }]}>
                    {setting.label}
                  </ThemedText>
                  <ThemedText style={[styles.settingDescription, { color: subtitleColor }]}>
                    {setting.description}
                  </ThemedText>
                  {setting.min !== undefined && setting.max !== undefined && (
                    <ThemedText style={[styles.settingRange, { color: subtitleColor }]}>
                      Range: {setting.min} - {setting.max} {setting.unit || ''}
                    </ThemedText>
                  )}
                </ThemedView>
                
                <ThemedView style={styles.settingControl}>
                  {renderSetting(setting, sectionIndex)}
                </ThemedView>
              </ThemedView>
            ))}
          </Card>
        ))}

        {/* Actions */}
        <Card style={styles.actionsCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Actions
          </ThemedText>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: tintColor + '10' }]}
            onPress={() => Alert.alert('Export Config', 'Configuration export functionality would be implemented here.')}
          >
            <Ionicons name="download-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.actionText, { color: tintColor }]}>
              Export Configuration
            </ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: subtitleColor + '10' }]}
            onPress={resetToDefaults}
          >
            <Ionicons name="refresh-outline" size={20} color={subtitleColor} />
            <ThemedText style={[styles.actionText, { color: subtitleColor }]}>
              Reset to Defaults
            </ThemedText>
          </TouchableOpacity>
        </Card>

        {hasChanges && (
          <Card style={[styles.saveCard, { backgroundColor: tintColor + '10' }]}>
            <ThemedText style={[styles.saveMessage, { color: tintColor }]}>
              You have unsaved changes. Don't forget to save your configuration.
            </ThemedText>
          </Card>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  headerCard: {
    marginBottom: Layout.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  headerText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.3,
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  sectionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  settingContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  settingLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  settingDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.2,
  },
  settingRange: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs / 2,
  },
  settingControl: {
    marginLeft: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  numberInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  numberInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    width: 60,
    textAlign: 'center',
  },
  unitText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.xs,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    minWidth: 120,
  },
  actionsCard: {
    marginBottom: Layout.spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.sm,
  },
  actionText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
  },
  saveCard: {
    marginBottom: Layout.spacing.lg,
  },
  saveMessage: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});
