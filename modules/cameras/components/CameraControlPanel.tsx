// labwatch-app/modules/cameras/components/CameraControlPanel.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { CameraConfiguration } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';

interface CameraControlPanelProps {
  camera: CameraConfiguration;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
  onToggleNightVision?: (enabled: boolean) => void;
  onToggleMotionDetection?: (enabled: boolean) => void;
  onTakeSnapshot?: () => void;
  isLoading?: boolean;
}

const CameraControlPanel: React.FC<CameraControlPanelProps> = ({
  camera,
  onStartRecording,
  onStopRecording,
  onToggleNightVision,
  onToggleMotionDetection,
  onTakeSnapshot,
  isLoading = false,
}) => {
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');
  const warningColor = useThemeColor({}, 'warningText');

  const handleRecordingToggle = () => {
    if (camera.isRecording) {
      onStopRecording?.();
    } else {
      onStartRecording?.();
    }
  };

  return (
    <Card style={styles.container}>
      <ThemedView style={styles.header}>
        <Ionicons name="settings-outline" size={20} color={tintColor} />
        <ThemedText style={[styles.title, { color: textColor }]}>
          Camera Controls
        </ThemedText>
      </ThemedView>

      {/* Main Controls */}
      <ThemedView style={styles.controlsGrid}>
        {/* Recording Control */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            {
              backgroundColor: camera.isRecording ? errorColor + '15' : successColor + '15',
              borderColor: camera.isRecording ? errorColor : successColor,
            }
          ]}
          onPress={handleRecordingToggle}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={camera.isRecording ? errorColor : successColor} />
          ) : (
            <Ionicons
              name={camera.isRecording ? "stop-circle" : "radio-button-on"}
              size={24}
              color={camera.isRecording ? errorColor : successColor}
            />
          )}
          <ThemedText style={[
            styles.controlButtonText,
            { color: camera.isRecording ? errorColor : successColor }
          ]}>
            {camera.isRecording ? 'Stop Recording' : 'Start Recording'}
          </ThemedText>
        </TouchableOpacity>

        {/* Snapshot Control */}
        <TouchableOpacity
          style={[
            styles.controlButton,
            { backgroundColor: tintColor + '15', borderColor: tintColor }
          ]}
          onPress={onTakeSnapshot}
          disabled={isLoading}
          activeOpacity={0.7}
        >
          <Ionicons name="camera" size={24} color={tintColor} />
          <ThemedText style={[styles.controlButtonText, { color: tintColor }]}>
            Take Snapshot
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Feature Toggles */}
      <ThemedView style={styles.featuresSection}>
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
          Features
        </ThemedText>

        <ThemedView style={styles.featuresList}>
          {/* Night Vision Toggle */}
          <TouchableOpacity
            style={styles.featureToggle}
            onPress={() => onToggleNightVision?.(!camera.nightVisionEnabled)}
            disabled={isLoading}
            activeOpacity={0.7}
          >
            <ThemedView style={styles.featureInfo}>
              <Ionicons
                name={camera.nightVisionEnabled ? "moon" : "sunny"}
                size={20}
                color={camera.nightVisionEnabled ? warningColor : subtleTextColor}
              />
              <ThemedText style={[styles.featureLabel, { color: textColor }]}>
                Night Vision
              </ThemedText>
            </ThemedView>
            <ThemedView style={[
              styles.toggleSwitch,
              {
                backgroundColor: camera.nightVisionEnabled ? warningColor : subtleTextColor + '30',
              }
            ]}>
              <ThemedView style={[
                styles.toggleThumb,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: camera.nightVisionEnabled ? 18 : 2 }],
                }
              ]} />
            </ThemedView>
          </TouchableOpacity>

          {/* Audio Recording Status (read-only for now) */}
          <ThemedView style={styles.featureToggle}>
            <ThemedView style={styles.featureInfo}>
              <Ionicons
                name={camera.audioRecordingEnabled ? "volume-high" : "volume-mute"}
                size={20}
                color={camera.audioRecordingEnabled ? tintColor : subtleTextColor}
              />
              <ThemedText style={[styles.featureLabel, { color: textColor }]}>
                Audio Recording
              </ThemedText>
            </ThemedView>
            <ThemedText style={[styles.statusText, { color: subtleTextColor }]}>
              {camera.audioRecordingEnabled ? 'Enabled' : 'Disabled'}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  title: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
  controlsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  controlButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginHorizontal: Layout.spacing.xs,
  },
  controlButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  featuresSection: {
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  featuresList: {
    backgroundColor: 'transparent',
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  featureInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  featureLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
  },
  toggleSwitch: {
    width: 40,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    position: 'absolute',
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
});

export default CameraControlPanel;
