// labwatch-app/modules/cameras/components/PeopleDetectionDemo.tsx

import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { CameraConfiguration, DEFAULT_PEOPLE_DETECTION_SETTINGS } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { useSimplePeopleDetection } from '../hooks/useSimplePeopleDetection';
import CameraLiveView from './CameraLiveView';
import PeopleCounter from './PeopleCounter';

interface PeopleDetectionDemoProps {
  camera: CameraConfiguration;
}

export default function PeopleDetectionDemo({ camera }: PeopleDetectionDemoProps) {
  const [showSettings, setShowSettings] = useState(false);
  
  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const cardBackground = useThemeColor({}, 'cardBackground');

  // People detection hook
  const peopleDetection = useSimplePeopleDetection({
    cameraId: camera.id,
    roomId: camera.roomId,
    config: camera.peopleDetectionSettings || DEFAULT_PEOPLE_DETECTION_SETTINGS,
    autoStart: false, // Manual start for demo
    onCountChange: (current: number, previous: number) => {
      Alert.alert(
        'People Count Changed',
        `Count changed from ${previous} to ${current} people`,
        [{ text: 'OK' }]
      );
    },
    onPersonEntered: (count: number) => {
      console.log(`✅ Person entered! New count: ${count}`);
    },
    onPersonExited: (count: number) => {
      console.log(`❌ Person exited! New count: ${count}`);
    },
    onError: (error: string) => {
      Alert.alert('Detection Error', error);
    }
  });

  const handleToggleDetection = async () => {
    try {
      if (peopleDetection.isActive) {
        peopleDetection.stopDetection();
      } else {
        await peopleDetection.startDetection();
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to toggle people detection');
    }
  };

  const handleUpdateSettings = () => {
    peopleDetection.updateConfig({
      confidenceThreshold: 0.7,
      detectionInterval: 1500,
      alertOnCountChange: true
    });
    Alert.alert('Settings Updated', 'People detection settings have been updated');
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Header */}
      <ThemedView style={[styles.header, { backgroundColor: cardBackground }]}>
        <View style={styles.titleSection}>
          <Ionicons name="eye" size={28} color={tintColor} />
          <ThemedText style={[styles.title, { color: textColor }]}>
            AI People Detection Demo
          </ThemedText>
        </View>
        <ThemedText style={[styles.subtitle, { color: subtleTextColor }]}>
          {camera.name}
        </ThemedText>
      </ThemedView>

      {/* Camera Live View with People Detection */}
      <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Live Camera Feed
        </ThemedText>
        <CameraLiveView
          camera={camera}
          enablePeopleDetection={true}
          showPeopleCounter={true}
          style={styles.cameraView}
        />
      </ThemedView>

      {/* People Counter (Standalone) */}
      <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          People Counter
        </ThemedText>
        <PeopleCounter
          count={peopleDetection.currentCount}
          detectedPersons={peopleDetection.detectedPersons}
          isActive={peopleDetection.isActive}
          isInitializing={peopleDetection.isInitializing}
          error={peopleDetection.error}
          stats={peopleDetection.state.stats}
          showStats={true}
          onToggleDetection={handleToggleDetection}
          onShowDetails={() => {
            Alert.alert(
              'Detection Details',
              `Current Count: ${peopleDetection.currentCount}\n` +
              `Total Detections: ${peopleDetection.state.stats.totalDetections}\n` +
              `Average Count: ${peopleDetection.state.stats.averageCount.toFixed(1)}\n` +
              `Max Count: ${peopleDetection.state.stats.maxCount}\n` +
              `Accuracy: ${(peopleDetection.state.stats.detectionAccuracy * 100).toFixed(1)}%`
            );
          }}
        />
      </ThemedView>

      {/* Detection Statistics */}
      <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Detection Statistics
        </ThemedText>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {peopleDetection.state.stats.totalDetections}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Total Detections
            </ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {peopleDetection.state.stats.averageCount.toFixed(1)}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Average Count
            </ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {peopleDetection.state.stats.maxCount}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Peak Count
            </ThemedText>
          </View>
          
          <View style={styles.statCard}>
            <ThemedText style={[styles.statValue, { color: textColor }]}>
              {(peopleDetection.state.stats.detectionAccuracy * 100).toFixed(0)}%
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: subtleTextColor }]}>
              Accuracy
            </ThemedText>
          </View>
        </View>
      </ThemedView>

      {/* Current Configuration */}
      <ThemedView style={[styles.section, { backgroundColor: cardBackground }]}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Current Configuration
        </ThemedText>
        
        <View style={styles.configRow}>
          <ThemedText style={[styles.configLabel, { color: subtleTextColor }]}>
            Confidence Threshold:
          </ThemedText>
          <ThemedText style={[styles.configValue, { color: textColor }]}>
            {(peopleDetection.state.config.confidenceThreshold * 100).toFixed(0)}%
          </ThemedText>
        </View>
        
        <View style={styles.configRow}>
          <ThemedText style={[styles.configLabel, { color: subtleTextColor }]}>
            Detection Interval:
          </ThemedText>
          <ThemedText style={[styles.configValue, { color: textColor }]}>
            {peopleDetection.state.config.detectionInterval}ms
          </ThemedText>
        </View>
        
        <View style={styles.configRow}>
          <ThemedText style={[styles.configLabel, { color: subtleTextColor }]}>
            Tracking Enabled:
          </ThemedText>
          <ThemedText style={[styles.configValue, { color: textColor }]}>
            {peopleDetection.state.config.trackingEnabled ? 'Yes' : 'No'}
          </ThemedText>
        </View>
        
        <View style={styles.configRow}>
          <ThemedText style={[styles.configLabel, { color: subtleTextColor }]}>
            Save Events:
          </ThemedText>
          <ThemedText style={[styles.configValue, { color: textColor }]}>
            {peopleDetection.state.config.saveDetectionEvents ? 'Yes' : 'No'}
          </ThemedText>
        </View>
      </ThemedView>

      {/* Error Display */}
      {peopleDetection.error && (
        <ThemedView style={[styles.errorSection, { backgroundColor: 'rgba(255, 59, 48, 0.1)' }]}>
          <Ionicons name="warning" size={24} color="#FF3B30" />
          <ThemedText style={[styles.errorText, { color: '#FF3B30' }]}>
            {peopleDetection.error}
          </ThemedText>
        </ThemedView>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
    margin: Layout.spacing.md,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.md,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  section: {
    margin: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  cameraView: {
    // Additional styles for camera view
  },
  controlsRow: {
    flexDirection: 'row',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.md,
  },
  controlButton: {
    flex: 1,
    borderRadius: Layout.borderRadius.md,
    paddingVertical: Layout.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    color: '#fff',
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    alignItems: 'center',
    padding: Layout.spacing.md,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
    borderRadius: Layout.borderRadius.md,
  },
  statValue: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
  },
  statLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  configLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  configValue: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  errorSection: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: Layout.spacing.md,
    padding: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.lg,
  },
  errorText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.md,
    flex: 1,
  },
});
