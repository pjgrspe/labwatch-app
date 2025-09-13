// app/modals/camera-detail.tsx
import { AppButton, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import CameraLiveView from '@/modules/cameras/components/CameraLiveView';
import { CameraService } from '@/modules/cameras/services/CameraService';
import { CameraConfiguration } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

export default function CameraDetailModal() {
  const router = useRouter();
  const { cameraId } = useLocalSearchParams<{ cameraId: string }>();
  
  const [camera, setCamera] = useState<CameraConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [lastSnapshot, setLastSnapshot] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'testing'>('disconnected');
  
  const refreshInterval = useRef<number | null>(null);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText') || '#4CAF50';

  useEffect(() => {
    loadCamera();
    
    return () => {
      if (refreshInterval.current) {
        clearInterval(refreshInterval.current);
      }
    };
  }, [cameraId]);

  // Real-time listener for camera updates
  useEffect(() => {
    if (!cameraId) return;

    const unsubscribe = CameraService.onCameraUpdate(
      cameraId,
      (updatedCamera) => {
        if (updatedCamera) {
          setCamera(updatedCamera);
          setIsRecording(updatedCamera.isRecording);
          // Update connection status from database
          if (updatedCamera.connectionStatus) {
            setConnectionStatus(updatedCamera.connectionStatus as 'connected' | 'disconnected' | 'testing');
          }
        }
      },
      (error) => {
        console.error('Error listening to camera updates:', error);
      }
    );

    return unsubscribe;
  }, [cameraId]);

  const loadCamera = async () => {
    if (!cameraId) return;
    
    try {
      const cameraData = await CameraService.getCameraById(cameraId);
      if (cameraData) {
        setCamera(cameraData);
        setIsRecording(cameraData.isRecording);
        
        // Set initial connection status from the database
        if (cameraData.connectionStatus) {
          setConnectionStatus(cameraData.connectionStatus as 'connected' | 'disconnected' | 'testing');
        } else {
          // If no connection status is stored, test the connection
          await testConnection();
        }
        
        startPeriodicSnapshot();
      }
    } catch (error) {
      console.error('Error loading camera:', error);
      Alert.alert('Error', 'Failed to load camera data.');
    } finally {
      setIsLoading(false);
    }
  };

  const testConnection = async () => {
    if (!cameraId) return;
    
    setConnectionStatus('testing');
    try {
      const isConnected = await CameraService.testCameraConnection(cameraId);
      const newStatus = isConnected ? 'connected' : 'disconnected';
      setConnectionStatus(newStatus);
      
      // Also update the camera object locally for immediate UI feedback
      if (camera) {
        setCamera(prev => prev ? { ...prev, connectionStatus: newStatus } : null);
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setConnectionStatus('disconnected');
      if (camera) {
        setCamera(prev => prev ? { ...prev, connectionStatus: 'disconnected' } : null);
      }
    }
  };

  const startPeriodicSnapshot = () => {
    if (refreshInterval.current) {
      clearInterval(refreshInterval.current);
    }
    
    // Take a snapshot every 5 seconds for live view simulation
    refreshInterval.current = setInterval(() => {
      takeSnapshot();
    }, 5000);
    
    // Take initial snapshot
    takeSnapshot();
  };

  const takeSnapshot = async () => {
    if (!cameraId || connectionStatus !== 'connected') return;
    
    try {
      // Simulate taking a snapshot by generating a placeholder image URL
      // In real implementation, this would call the actual camera API
      const timestamp = Date.now();
      const simulatedSnapshot = `https://picsum.photos/640/480?random=${timestamp}`;
      setLastSnapshot(simulatedSnapshot);
    } catch (error) {
      console.error('Error taking snapshot:', error);
    }
  };

  const handleStartRecording = async () => {
    if (!cameraId) return;
    
    try {
      await CameraService.startRecording(cameraId);
      setIsRecording(true);
      Alert.alert('Success', 'Recording started successfully!');
    } catch (error) {
      console.error('Error starting recording:', error);
      Alert.alert('Error', 'Failed to start recording.');
    }
  };

  const handleStopRecording = async () => {
    if (!cameraId) return;
    
    try {
      await CameraService.stopRecording(cameraId);
      setIsRecording(false);
      Alert.alert('Success', 'Recording stopped successfully!');
    } catch (error) {
      console.error('Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording.');
    }
  };

  const handleToggleNightVision = async () => {
    if (!cameraId || !camera) return;
    
    try {
      await CameraService.toggleNightVision(cameraId, !camera.nightVisionEnabled);
      setCamera(prev => prev ? { ...prev, nightVisionEnabled: !prev.nightVisionEnabled } : null);
      Alert.alert('Success', `Night vision ${camera.nightVisionEnabled ? 'disabled' : 'enabled'}!`);
    } catch (error) {
      console.error('Error toggling night vision:', error);
      Alert.alert('Error', 'Failed to toggle night vision.');
    }
  };

  const handleEditCamera = () => {
    router.push(`/modals/edit-camera?cameraId=${cameraId}` as any);
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return successColor;
      case 'disconnected':
        return errorColor;
      case 'testing':
        return tintColor;
      default:
        return textColor;
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'testing':
        return 'Testing...';
      default:
        return 'Unknown';
    }
  };

  if (isLoading || !camera) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Camera Details',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close" size={24} color={tintColor} />
              </TouchableOpacity>
            ),
          }} 
        />
        <ThemedView style={[styles.loadingContainer, { backgroundColor: containerBackgroundColor }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading camera...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: camera.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={tintColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleEditCamera}>
              <Ionicons name="settings" size={24} color={tintColor} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView
        style={[styles.container, { backgroundColor: containerBackgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Live View Section */}
        <ThemedView style={styles.liveViewContainer}>
          <CameraLiveView 
            camera={camera} 
            style={styles.liveViewWrapper} 
            connectionStatus={connectionStatus}
          />
        </ThemedView>

        {/* Camera Controls */}
        <ThemedView style={styles.controlsSection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Camera Controls
          </ThemedText>
          
          <View style={styles.controlRow}>
            <AppButton
              title={isRecording ? 'Stop Recording' : 'Start Recording'}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
              disabled={connectionStatus !== 'connected'}
              variant={isRecording ? 'outline' : 'filled'}
              leftIcon={isRecording ? 'stop' : 'radio-button-on'}
              style={styles.controlButton}
            />
            
            <AppButton
              title="Take Snapshot"
              onPress={takeSnapshot}
              disabled={connectionStatus !== 'connected'}
              variant="outline"
              leftIcon="camera"
              style={styles.controlButton}
            />
          </View>

          <View style={styles.controlRow}>
            <AppButton
              title={camera.nightVisionEnabled ? 'Disable Night Vision' : 'Enable Night Vision'}
              onPress={handleToggleNightVision}
              disabled={connectionStatus !== 'connected'}
              variant="outline"
              leftIcon={camera.nightVisionEnabled ? 'moon' : 'moon-outline'}
              style={styles.controlButton}
            />
            
            <AppButton
              title="Test Connection"
              onPress={testConnection}
              variant="outline"
              leftIcon="wifi"
              style={styles.controlButton}
            />
          </View>
        </ThemedView>

        {/* Camera Information */}
        <ThemedView style={styles.infoSection}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Camera Information
          </ThemedText>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>Model</ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>{camera.model}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>IP Address</ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>{camera.credentials.ipAddress}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>Port</ThemedText>
              <ThemedText style={[styles.infoValue, { color: textColor }]}>{camera.credentials.port}</ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>Status</ThemedText>
              <ThemedText style={[styles.infoValue, { color: camera.isActive ? successColor : errorColor }]}>
                {camera.isActive ? 'Active' : 'Inactive'}
              </ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>Motion Detection</ThemedText>
              <ThemedText style={[styles.infoValue, { color: camera.motionDetectionEnabled ? successColor : errorColor }]}>
                {camera.motionDetectionEnabled ? 'Enabled' : 'Disabled'}
              </ThemedText>
            </View>
            
            <View style={styles.infoItem}>
              <ThemedText style={[styles.infoLabel, { color: textColor }]}>Audio Recording</ThemedText>
              <ThemedText style={[styles.infoValue, { color: camera.audioRecordingEnabled ? successColor : errorColor }]}>
                {camera.audioRecordingEnabled ? 'Enabled' : 'Disabled'}
              </ThemedText>
            </View>
          </View>
        </ThemedView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  liveViewContainer: {
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: 0,
  },
  liveViewWrapper: {
    flex: 1,
  },
  recordingIndicator: {
    position: 'absolute',
    top: Layout.spacing.md,
    left: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    marginRight: Layout.spacing.xs,
  },
  recordingText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
  },
  statusIndicator: {
    position: 'absolute',
    top: Layout.spacing.md,
    right: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
  },
  controlsSection: {
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.lg,
    paddingHorizontal: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  controlRow: {
    flexDirection: 'row',
    gap: Layout.spacing.sm,
    marginBottom: Layout.spacing.sm,
  },
  controlButton: {
    flex: 1,
  },
  infoSection: {
    backgroundColor: 'transparent',
    paddingHorizontal: Layout.spacing.md,
  },
  infoGrid: {
    gap: Layout.spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  infoLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  infoValue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'right',
    flex: 1,
  },
});
