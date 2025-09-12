// labwatch-app/modules/cameras/components/CameraCard.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { CameraConfiguration } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, TouchableOpacity, View } from 'react-native';
import { CameraService } from '../services/CameraService';
import CameraLiveView from './CameraLiveView';

interface CameraCardProps {
  camera: CameraConfiguration;
  onPress?: () => void;
  onSettingsPress?: () => void;
  onTestConnection?: () => void;
  isTestingConnection?: boolean;
  enableSmartStatus?: boolean; // New prop to enable smart status checking
  showLiveVideo?: boolean; // New prop to show live video instead of static preview
}

interface CameraCardProps {
  camera: CameraConfiguration;
  onPress?: () => void;
  onSettingsPress?: () => void;
  onTestConnection?: () => void;
  isTestingConnection?: boolean;
}

const CameraCard: React.FC<CameraCardProps> = ({
  camera,
  onPress,
  onSettingsPress,
  onTestConnection,
  isTestingConnection = false,
  enableSmartStatus = false,
  showLiveVideo = false,
}) => {
  const router = useRouter();
  const currentTheme = useCurrentTheme();
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const successColor = useThemeColor({}, 'successText');
  const errorColor = useThemeColor({}, 'errorText');
  const warningColor = useThemeColor({}, 'warningText');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');

  // Smart status state
  const [isStreamAvailable, setIsStreamAvailable] = useState(false);
  const [isCheckingStream, setIsCheckingStream] = useState(false);

  // Check HLS stream availability when smart status is enabled
  useEffect(() => {
    if (!enableSmartStatus) return;

    let mounted = true;
    const checkStream = async () => {
      if (!mounted) return;
      
      setIsCheckingStream(true);
      try {
        const hlsUrl = CameraService.generateHLSUrl(camera);
        // Simple HEAD request to check if HLS stream is available
        const response = await fetch(hlsUrl, { method: 'HEAD' });
        if (mounted) {
          setIsStreamAvailable(response.ok);
        }
      } catch (error) {
        if (mounted) {
          setIsStreamAvailable(false);
        }
      } finally {
        if (mounted) {
          setIsCheckingStream(false);
        }
      }
    };

    // Initial check
    checkStream();

    // Periodic check every 30 seconds
    const interval = setInterval(checkStream, 30000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [camera, enableSmartStatus]);

  // Get effective connection status considering smart status
  const getEffectiveConnectionStatus = () => {
    if (enableSmartStatus && isStreamAvailable) {
      return 'connected';
    }
    if (isCheckingStream) {
      return 'testing';
    }
    return camera.connectionStatus || 'disconnected';
  };

  const effectiveStatus = getEffectiveConnectionStatus();

  const handleCardPress = () => {
    if (onPress) {
      onPress();
    } else {
      // Navigate to camera detail modal
      router.push(`/modals/camera-detail?cameraId=${camera.id}` as any);
    }
  };

  const handleSettingsPress = () => {
    if (onSettingsPress) {
      onSettingsPress();
    } else {
      // Navigate to edit camera modal
      router.push(`/modals/edit-camera?cameraId=${camera.id}` as any);
    }
  };

  const getConnectionStatusColor = () => {
    switch (effectiveStatus) {
      case 'connected':
        return successColor;
      case 'disconnected':
      case 'error':
        return errorColor;
      case 'testing':
        return warningColor;
      default:
        return warningColor;
    }
  };

  const getConnectionStatusIcon = () => {
    switch (effectiveStatus) {
      case 'connected':
        return 'checkmark-circle';
      case 'disconnected':
        return 'close-circle';
      case 'error':
        return 'warning';
      case 'testing':
        return 'hourglass';
      default:
        return 'help-circle';
    }
  };

  const getConnectionStatusText = () => {
    switch (effectiveStatus) {
      case 'connected':
        return 'Connected';
      case 'disconnected':
        return 'Disconnected';
      case 'error':
        return 'Error';
      case 'testing':
        return 'Testing...';
      default:
        return 'Unknown';
    }
  };

  return (
    <TouchableOpacity onPress={handleCardPress} activeOpacity={0.8}>
      <Card style={[styles.cameraCard, { borderColor, borderLeftColor: getConnectionStatusColor() }]}>
        <ThemedView style={styles.cardContent}>
          {/* Header */}
          <ThemedView style={styles.cardHeader}>
            <ThemedView style={styles.cameraInfo}>
              <Ionicons name="videocam" size={20} color={tintColor} />
              <ThemedText style={[styles.cameraName, { color: textColor }]} numberOfLines={1}>
                {camera.name}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.headerActions}>
              {onTestConnection && (
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={onTestConnection}
                  disabled={isTestingConnection}
                  activeOpacity={0.7}
                >
                  {isTestingConnection ? (
                    <Ionicons name="hourglass" size={16} color={subtleTextColor} />
                  ) : (
                    <Ionicons name="refresh" size={16} color={tintColor} />
                  )}
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.actionButton}
                onPress={handleSettingsPress}
                activeOpacity={0.7}
              >
                <Ionicons name="settings-outline" size={16} color={subtleTextColor} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Camera Preview/Live Video */}
          <View style={styles.previewContainer}>
            {showLiveVideo ? (
              // Show live video feed
              <CameraLiveView 
                camera={camera} 
                style={styles.liveVideoContainer}
                connectionStatus={effectiveStatus === 'unknown' || effectiveStatus === 'error' ? 'disconnected' : effectiveStatus}
                compact={true}
              />
            ) : (
              // Show static preview or placeholder
              <>
                {camera.thumbnailUrl ? (
                  <Image 
                    source={{ uri: camera.thumbnailUrl }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                ) : (
                  <ThemedView style={[styles.previewPlaceholder, { backgroundColor: subtleTextColor + '10' }]}>
                    <View style={[styles.placeholderIconContainer, { backgroundColor: subtleTextColor + '20' }]}>
                      <Ionicons name="videocam-outline" size={32} color={subtleTextColor} />
                    </View>
                    <ThemedText style={[styles.placeholderText, { color: subtleTextColor }]}>
                      Camera Preview
                    </ThemedText>
                    <ThemedText style={[styles.placeholderSubtext, { color: subtleTextColor }]}>
                      Connect to view live feed
                    </ThemedText>
                  </ThemedView>
                )}
                
                {/* Status overlay - only show on static preview, not on live video */}
                <View style={[styles.statusOverlay, { backgroundColor: getConnectionStatusColor() + '90' }]}>
                  <View style={styles.statusContent}>
                    <Ionicons 
                      name={getConnectionStatusIcon()} 
                      size={12} 
                      color="#FFFFFF" 
                    />
                    <ThemedText style={[styles.statusText, { color: '#FFFFFF' }]}>
                      {getConnectionStatusText()}
                    </ThemedText>
                  </View>
                </View>
              </>
            )}

            {/* Recording indicator - show on both static and live preview */}
            {camera.isRecording && (
              <View style={styles.recordingIndicator}>
                <View style={styles.recordingDot} />
                <ThemedText style={[styles.recordingText, { color: '#FFFFFF' }]}>
                  REC
                </ThemedText>
              </View>
            )}
          </View>

          {/* Camera Details */}
          <ThemedView style={styles.detailsContainer}>
            <ThemedView style={styles.detailRow}>
              <Ionicons name="location-outline" size={14} color={subtleTextColor} />
              <ThemedText style={[styles.detailText, { color: subtleTextColor }]} numberOfLines={1}>
                {camera.credentials.ipAddress}
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.detailRow}>
              <Ionicons name="hardware-chip-outline" size={14} color={subtleTextColor} />
              <ThemedText style={[styles.detailText, { color: subtleTextColor }]} numberOfLines={1}>
                {camera.model}
              </ThemedText>
            </ThemedView>
          </ThemedView>

          {/* Features Status */}
          <ThemedView style={styles.featuresContainer}>
            <ThemedView style={styles.featureItem}>
              <Ionicons 
                name={camera.isRecording ? "radio-button-on" : "radio-button-off"} 
                size={14} 
                color={camera.isRecording ? errorColor : subtleTextColor} 
              />
              <ThemedText style={[styles.featureText, { color: subtleTextColor }]}>
                Recording
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons 
                name={camera.motionDetectionEnabled ? "eye" : "eye-off"} 
                size={14} 
                color={camera.motionDetectionEnabled ? successColor : subtleTextColor} 
              />
              <ThemedText style={[styles.featureText, { color: subtleTextColor }]}>
                Motion
              </ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.featureItem}>
              <Ionicons 
                name={camera.nightVisionEnabled ? "moon" : "sunny"} 
                size={14} 
                color={camera.nightVisionEnabled ? warningColor : subtleTextColor} 
              />
              <ThemedText style={[styles.featureText, { color: subtleTextColor }]}>
                Night Vision
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </Card>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cameraCard: {
    borderLeftWidth: 4,
    marginBottom: Layout.spacing.md,
  },
  cardContent: {
    backgroundColor: 'transparent',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  cameraInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  cameraName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
  },
  actionButton: {
    padding: Layout.spacing.xs,
    marginLeft: Layout.spacing.xs,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  previewImage: {
    width: '100%',
    height: 120,
    borderRadius: Layout.borderRadius.md,
  },
  liveVideoContainer: {
    width: '100%',
    height: 160, // Increased height for better live video display
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  previewPlaceholder: {
    width: '100%',
    height: 120,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.xs,
    textAlign: 'center',
  },
  placeholderIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  placeholderSubtext: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: Layout.spacing.xs / 2,
  },
  statusOverlay: {
    position: 'absolute',
    top: Layout.spacing.xs,
    right: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  statusContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  recordingIndicator: {
    position: 'absolute',
    top: Layout.spacing.xs,
    left: Layout.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  recordingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FFFFFF',
    marginRight: Layout.spacing.xs / 2,
  },
  recordingText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    color: '#FFFFFF',
  },
  detailsContainer: {
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs / 2,
    backgroundColor: 'transparent',
  },
  detailText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  featureText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.xs / 2,
  },
});

export default CameraCard;
