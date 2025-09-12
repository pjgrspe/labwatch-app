// labwatch-app/modules/cameras/components/CameraSection.tsx
import { Card, SectionHeader, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { CameraConfiguration } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import CameraCard from './CameraCard';

interface CameraSectionProps {
  roomId: string;
  cameras: CameraConfiguration[];
  isLoading?: boolean;
  onTestConnection?: (cameraId: string) => void;
  testingCameraId?: string;
}

const CameraSection: React.FC<CameraSectionProps> = ({
  roomId,
  cameras,
  isLoading = false,
  onTestConnection,
  testingCameraId,
}) => {
  const router = useRouter();
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const handleAddCamera = () => {
    router.push(`/modals/add-camera?roomId=${roomId}` as any);
  };

  const handleCameraPress = (camera: CameraConfiguration) => {
    router.push(`/modals/camera-detail?cameraId=${camera.id}` as any);
  };

  const handleCameraSettings = (camera: CameraConfiguration) => {
    router.push(`/modals/edit-camera?cameraId=${camera.id}` as any);
  };

  if (isLoading) {
    return (
      <Card style={styles.loadingCard}>
        <ThemedView style={styles.loadingContent}>
          <Ionicons name="videocam-outline" size={48} color={subtleTextColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading cameras...
          </ThemedText>
        </ThemedView>
      </Card>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <SectionHeader 
        title="Camera Monitoring" 
        onPressViewAll={cameras.length > 0 ? () => router.push(`/(tabs)/rooms/${roomId}/cameras` as any) : undefined}
      />

      {cameras.length === 0 ? (
        <Card style={styles.emptyCard}>
          <ThemedView style={styles.emptyContent}>
            <Ionicons name="camera-outline" size={48} color={subtleTextColor} />
            <ThemedText style={[styles.emptyTitle, { color: textColor }]}>
              No Cameras Configured
            </ThemedText>
            <ThemedText style={[styles.emptyText, { color: subtleTextColor }]}>
              Add a Tapo CCTV camera to monitor this room remotely and receive motion alerts.
            </ThemedText>
            <TouchableOpacity
              style={[styles.addButton, { backgroundColor: tintColor }]}
              onPress={handleAddCamera}
              activeOpacity={0.8}
            >
              <Ionicons name="add" size={20} color="#FFFFFF" />
              <ThemedText style={styles.addButtonText}>
                Add Camera
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </Card>
      ) : (
        <ThemedView style={styles.camerasContainer}>
          {cameras.slice(0, 2).map((camera) => (
            <CameraCard
              key={camera.id}
              camera={camera}
              onPress={() => handleCameraPress(camera)}
              onSettingsPress={() => handleCameraSettings(camera)}
              onTestConnection={() => onTestConnection?.(camera.id)}
              isTestingConnection={testingCameraId === camera.id}
              enableSmartStatus={true}
              showLiveVideo={true}
            />
          ))}
          
          {cameras.length > 2 && (
            <TouchableOpacity
              style={styles.viewAllButton}
              onPress={() => router.push(`/(tabs)/rooms/${roomId}/cameras` as any)}
              activeOpacity={0.7}
            >
              <ThemedText style={[styles.viewAllText, { color: tintColor }]}>
                View All {cameras.length} Cameras
              </ThemedText>
              <Ionicons name="chevron-forward" size={16} color={tintColor} />
            </TouchableOpacity>
          )}

          {/* Add Camera Button */}
          <TouchableOpacity
            style={[styles.addCameraButton, { borderColor: tintColor }]}
            onPress={handleAddCamera}
            activeOpacity={0.7}
          >
            <Ionicons name="add-circle-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.addCameraText, { color: tintColor }]}>
              Add Another Camera
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  loadingCard: {
    marginBottom: Layout.spacing.md,
  },
  loadingContent: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.md,
  },
  emptyCard: {
    marginBottom: Layout.spacing.md,
  },
  emptyContent: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  emptyTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginTop: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  emptyText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: Layout.fontSize.md * 1.4,
    marginBottom: Layout.spacing.lg,
    maxWidth: 280,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
  camerasContainer: {
    backgroundColor: 'transparent',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  viewAllText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginRight: Layout.spacing.xs,
  },
  addCameraButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.sm,
  },
  addCameraText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
  },
});

export default CameraSection;
