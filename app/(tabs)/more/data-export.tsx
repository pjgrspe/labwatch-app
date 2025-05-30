// app/(tabs)/more/data-export.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, TouchableOpacity } from 'react-native';

interface ExportOption {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  enabled: boolean;
}

interface DateRange {
  label: string;
  value: string;
  days: number;
}

export default function DataExportScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');

  const [selectedDateRange, setSelectedDateRange] = useState('7days');
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState<ExportOption[]>([
    {
      id: 'sensor_data',
      title: 'Sensor Data',
      description: 'Temperature, humidity, and gas readings',
      icon: 'analytics-outline',
      enabled: true,
    },
    {
      id: 'alerts',
      title: 'Alert History',
      description: 'All triggered alerts and notifications',
      icon: 'notifications-outline',
      enabled: true,
    },
    {
      id: 'incidents',
      title: 'Incident Reports',
      description: 'Documented safety incidents',
      icon: 'warning-outline',
      enabled: false,
    },
    {
      id: 'system_logs',
      title: 'System Logs',
      description: 'Device status and connectivity data',
      icon: 'list-outline',
      enabled: false,
    },
  ]);

  const dateRanges: DateRange[] = [
    { label: 'Last 24 Hours', value: '1day', days: 1 },
    { label: 'Last 7 Days', value: '7days', days: 7 },
    { label: 'Last 30 Days', value: '30days', days: 30 },
    { label: 'Last 90 Days', value: '90days', days: 90 },
    { label: 'Custom Range', value: 'custom', days: 0 },
  ];

  const exportFormats = [
    { label: 'CSV', value: 'csv', description: 'Comma-separated values' },
    { label: 'JSON', value: 'json', description: 'JavaScript Object Notation' },
    { label: 'PDF Report', value: 'pdf', description: 'Formatted summary report' },
  ];

  const [selectedFormat, setSelectedFormat] = useState('csv');

  const toggleExportOption = (id: string) => {
    setExportOptions(prev => 
      prev.map(option => 
        option.id === id ? { ...option, enabled: !option.enabled } : option
      )
    );
  };

  const handleExport = async () => {
    const enabledOptions = exportOptions.filter(option => option.enabled);
    
    if (enabledOptions.length === 0) {
      Alert.alert('No Data Selected', 'Please select at least one data type to export.');
      return;
    }

    setIsExporting(true);
    
    try {
      // Simulate export process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Export Complete',
        `Your data has been exported successfully. The ${selectedFormat.toUpperCase()} file will be available in your downloads.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Export Failed', 'There was an error exporting your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const getEstimatedSize = () => {
    const selectedRange = dateRanges.find(range => range.value === selectedDateRange);
    const enabledCount = exportOptions.filter(option => option.enabled).length;
    const baseSize = enabledCount * (selectedRange?.days || 1) * 0.5; // MB estimate
    return `~${Math.max(0.1, baseSize).toFixed(1)} MB`;
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Data Export' }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Export Summary */}
        <Card style={styles.summaryCard}>
          <ThemedView style={styles.summaryHeader}>
            <ThemedView style={[styles.summaryIconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name="download-outline" size={32} color={tintColor} />
            </ThemedView>
            <ThemedView style={styles.summaryInfo}>
              <ThemedText style={[styles.summaryTitle, { color: textColor }]}>
                Data Export
              </ThemedText>
              <ThemedText style={[styles.summarySubtitle, { color: subtitleColor }]}>
                Export sensor data and reports
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.summaryStats}>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: subtitleColor }]}>
                Estimated Size
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {getEstimatedSize()}
              </ThemedText>
            </ThemedView>
            <ThemedView style={styles.statItem}>
              <ThemedText style={[styles.statLabel, { color: subtitleColor }]}>
                Format
              </ThemedText>
              <ThemedText style={[styles.statValue, { color: textColor }]}>
                {selectedFormat.toUpperCase()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Date Range Selection */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Date Range
          </ThemedText>
          
          {dateRanges.map((range, index) => (
            <TouchableOpacity 
              key={range.value}
              style={[
                styles.optionRow,
                index < dateRanges.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }
              ]}
              onPress={() => setSelectedDateRange(range.value)}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedText style={[styles.optionTitle, { color: textColor }]}>
                  {range.label}
                </ThemedText>
                {range.days > 0 && (
                  <ThemedText style={[styles.optionDescription, { color: subtitleColor }]}>
                    {range.days} day{range.days > 1 ? 's' : ''} of data
                  </ThemedText>
                )}
              </ThemedView>
              <Ionicons 
                name={selectedDateRange === range.value ? "radio-button-on" : "radio-button-off"}
                size={20} 
                color={selectedDateRange === range.value ? tintColor : subtitleColor} 
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Data Types */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Data Types
          </ThemedText>
          
          {exportOptions.map((option, index) => (
            <ThemedView 
              key={option.id}
              style={[
                styles.optionRow,
                index < exportOptions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }
              ]}
            >
              <ThemedView style={[styles.optionIconContainer, { backgroundColor: tintColor + '15' }]}>
                <Ionicons name={option.icon} size={20} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.optionContent}>
                <ThemedText style={[styles.optionTitle, { color: textColor }]}>
                  {option.title}
                </ThemedText>
                <ThemedText style={[styles.optionDescription, { color: subtitleColor }]}>
                  {option.description}
                </ThemedText>
              </ThemedView>
              <Switch
                value={option.enabled}
                onValueChange={() => toggleExportOption(option.id)}
                trackColor={{ false: borderColor, true: tintColor + '30' }}
                thumbColor={option.enabled ? tintColor : '#f4f3f4'}
              />
            </ThemedView>
          ))}
        </Card>

        {/* Export Format */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Export Format
          </ThemedText>
          
          {exportFormats.map((format, index) => (
            <TouchableOpacity 
              key={format.value}
              style={[
                styles.optionRow,
                index < exportFormats.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }
              ]}
              onPress={() => setSelectedFormat(format.value)}
            >
              <ThemedView style={styles.optionContent}>
                <ThemedText style={[styles.optionTitle, { color: textColor }]}>
                  {format.label}
                </ThemedText>
                <ThemedText style={[styles.optionDescription, { color: subtitleColor }]}>
                  {format.description}
                </ThemedText>
              </ThemedView>
              <Ionicons 
                name={selectedFormat === format.value ? "radio-button-on" : "radio-button-off"}
                size={20} 
                color={selectedFormat === format.value ? tintColor : subtitleColor} 
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Export Button */}
        <TouchableOpacity 
          style={[
            styles.exportButton, 
            { backgroundColor: tintColor },
            isExporting && styles.exportButtonDisabled
          ]}
          onPress={handleExport}
          disabled={isExporting}
        >
          {isExporting ? (
            <>
              <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.exportButtonText}>
                Exporting...
              </ThemedText>
            </>
          ) : (
            <>
              <Ionicons name="download-outline" size={20} color="#FFFFFF" />
              <ThemedText style={styles.exportButtonText}>
                Export Data
              </ThemedText>
            </>
          )}
        </TouchableOpacity>
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
  summaryCard: {
    marginBottom: Layout.spacing.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  summaryIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  summaryInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  summaryTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  summarySubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  summaryStats: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  statItem: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  statLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  optionIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  optionContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  optionDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.md,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
});
