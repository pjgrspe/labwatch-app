import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { CameraConfiguration } from '@/types/camera';
import { DetectedPerson } from '@/types/peopleDetection';
import { Ionicons } from '@expo/vector-icons';
import { AVPlaybackStatus, ResizeMode, Video } from 'expo-av'; // Using expo-av for HLS playback
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, AppState, Dimensions, StyleSheet, View } from 'react-native';
import { useRealPeopleDetection } from '../hooks/useRealPeopleDetection';
import { CameraService } from '../services/CameraService';
import PeopleCounter from './PeopleCounter';

// Helper: Efficient smoothing optimized for performance
type BBox = [number, number, number, number];
type PersonKey = string | number;
function useSmoothedBboxes(detectedPersons: DetectedPerson[], smoothFrames: number = 3): DetectedPerson[] {
  const historyRef = React.useRef<Record<PersonKey, BBox[]>>({});
  
  React.useEffect(() => {
    // Only process if we have detections to avoid unnecessary work
    if (detectedPersons.length === 0) {
      // Clear history when no detections for memory efficiency
      historyRef.current = {};
      return;
    }

    detectedPersons.forEach((person: DetectedPerson, idx: number) => {
      const key: PersonKey = person.trackingId || idx;
      if (!historyRef.current[key]) historyRef.current[key] = [];
      historyRef.current[key].push(person.bbox as BBox);
      if (historyRef.current[key].length > smoothFrames) {
        historyRef.current[key].shift();
      }
    });
    
    // Efficient cleanup - only check keys that might be stale
    const currentKeys = new Set(detectedPersons.map((p, idx) => (p.trackingId || idx).toString()));
    Object.keys(historyRef.current).forEach((key: string) => {
      if (!currentKeys.has(key)) {
        delete historyRef.current[key];
      }
    });
  }, [detectedPersons, smoothFrames]);
  
  return React.useMemo(() => {
    // Early return for empty detections
    if (detectedPersons.length === 0) return [];
    
    return detectedPersons.map((person: DetectedPerson, idx: number) => {
      const key: PersonKey = person.trackingId || idx;
      const bboxes: BBox[] = historyRef.current[key] || [person.bbox as BBox];
      
      // Minimal processing for single detections
      if (bboxes.length === 1) {
        return person;
      } else {
        // Efficient averaging
        const smoothed: BBox = [0, 1, 2, 3].map(i => {
          const sum = bboxes.reduce((acc, bbox) => acc + bbox[i], 0);
          return sum / bboxes.length;
        }) as BBox;
        return { ...person, bbox: smoothed };
      }
    });
  }, [detectedPersons, smoothFrames]);
}

const { width: screenWidth } = Dimensions.get('window');

interface CameraLiveViewProps {
  camera: CameraConfiguration;
  style?: any;
  connectionStatus?: 'connected' | 'disconnected' | 'testing';
  compact?: boolean; // New prop to enable compact mode for cards
  enablePeopleDetection?: boolean; // Enable AI people detection
  showPeopleCounter?: boolean; // Show people counter overlay
}


export default function CameraLiveView({ 
  camera, 
  style, 
  connectionStatus, 
  compact = false,
  enablePeopleDetection = true,
  showPeopleCounter = true
}: CameraLiveViewProps) {
  // Smoothed bounding boxes for overlay (after correct peopleDetection declaration)
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);
  const [showDetectionOverlay, setShowDetectionOverlay] = useState(false);
  
  // Video ref for people detection
  const videoRef = useRef<Video>(null);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');
  const successColor = useThemeColor({}, 'successText');

  // Frame capture function - REAL camera frames with enhanced debugging
  const captureVideoFrame = async (): Promise<string | null> => {
    try {
      if (!videoRef.current) {
        console.log('❌ Video ref not available for frame capture');
        return null;
      }
      
      const status = await videoRef.current.getStatusAsync();
      if (status.isLoaded && videoIsPlaying) {
        console.log('📹 Capturing REAL frame from camera stream...');
        console.log('🔧 Camera details:', {
          id: camera.id,
          name: camera.name,
          ip: camera.credentials?.ipAddress,
          port: camera.credentials?.port,
          hasCredentials: !!(camera.credentials?.username && camera.credentials?.password)
        });
        
        // Use REAL snapshot URL with proper camera credentials
        const snapshotUrl = CameraService.generateSnapshotUrl(camera);
        console.log('✅ Generated snapshot URL (credentials hidden):', 
          snapshotUrl.replace(/user=[^&]*&pass=[^&]*/, 'user=***&pass=***'));
        
        // Test if we can reach the proxy first
        try {
          const proxyHost = process.env.SNAPSHOT_PROXY_HOST || '192.168.100.14';
          const proxyPort = process.env.SNAPSHOT_PROXY_PORT || '8080';
          const healthUrl = `http://${proxyHost}:${proxyPort}/health`;
          console.log('🔍 Testing proxy health at:', healthUrl);
          
          const testResponse = await fetch(healthUrl);
          if (!testResponse.ok) {
            console.error('❌ Snapshot proxy health check failed:', testResponse.status);
            return null;
          }
          console.log('✅ Snapshot proxy is responsive');
        } catch (error) {
          console.error('❌ Cannot reach snapshot proxy:', error);
          return null;
        }
        
        return snapshotUrl;
      }
      
      console.log('⚠️ Video not ready for frame capture');
      return null;
    } catch (error) {
      console.error('❌ Error capturing video frame:', error);
      return null;
    }
  };

  // People detection hook - restored for reliable detection
  const peopleDetection = useRealPeopleDetection({
    cameraId: camera.id,
    roomId: camera.roomId,
      config: {
        enabled: enablePeopleDetection,
        confidenceThreshold: 0.1, // VERY low for testing - catches almost anything
        detectionInterval: 600, // Fast response
        trackingEnabled: true,
        saveDetectionEvents: true,
        alertOnCountChange: true,
        frameCapture: captureVideoFrame // Add real frame capture function
      },
    autoStart: enablePeopleDetection && videoIsPlaying,
    enableBackground: false
  });

  // Use connection status from props if provided, otherwise from camera object
  const databaseConnectionStatus = connectionStatus || camera.connectionStatus || 'disconnected';
  
  // Smart connection status: if video is playing successfully, consider it connected
  const effectiveConnectionStatus = videoIsPlaying ? 'connected' : databaseConnectionStatus;

  // Generate HLS URL for streaming via MediaMTX proxy
  const hlsUrl = CameraService.generateHLSUrl(camera);

  // Initialize Real AI people detection when video starts playing - with debug logging
  useEffect(() => {
    if (videoIsPlaying && enablePeopleDetection && !peopleDetection.isInitialized) {
      console.log('🎥 Video is playing, initializing AI detection with debug logging...');
      console.log('📊 Detection config:', {
        enabled: enablePeopleDetection,
        confidenceThreshold: 0.3,
        detectionInterval: 800
      });
      peopleDetection.initialize();
    }
  }, [videoIsPlaying, enablePeopleDetection, peopleDetection.isInitialized]);

  // Start detection when video is playing and AI is initialized - REAL detection focus
  useEffect(() => {
    if (videoIsPlaying && peopleDetection.isInitialized && enablePeopleDetection && !peopleDetection.isDetecting) {
      console.log('🚀 Starting REAL AI detection...');
      console.log('🔧 REAL detection state:', {
        videoIsPlaying,
        isInitialized: peopleDetection.isInitialized,
        enablePeopleDetection,
        isDetecting: peopleDetection.isDetecting,
        cameraId: camera.id,
        roomId: camera.roomId,
        hlsUrl: hlsUrl
      });
      peopleDetection.startDetection();
    }
  }, [videoIsPlaying, peopleDetection.isInitialized, enablePeopleDetection, peopleDetection.isDetecting]);

  // Pause detection when app goes to background for performance (React Native)
  useEffect(() => {
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'background' || nextAppState === 'inactive') {
        if (peopleDetection.isDetecting) {
          console.log('� App backgrounded - pausing detection for performance');
          peopleDetection.stopDetection();
        }
      } else if (nextAppState === 'active') {
        if (videoIsPlaying && enablePeopleDetection && !peopleDetection.isDetecting && peopleDetection.isInitialized) {
          console.log('� App active - resuming detection');
          peopleDetection.startDetection();
        }
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [peopleDetection.isDetecting, videoIsPlaying, enablePeopleDetection, peopleDetection.isInitialized]);

  const onPlaybackStatusUpdate = (status: AVPlaybackStatus) => {
    if (status.isLoaded) {
      setIsLoading(false);
      setHasError(false);
      setVideoIsPlaying(true);
    } else if (status.error) {
      setIsLoading(false);
      setHasError(true);
      setVideoIsPlaying(false);
      setErrorMessage(status.error || 'Failed to load video stream');
    }
  };

  const onLoadStart = () => {
    setIsLoading(true);
    setHasError(false);
    setVideoIsPlaying(false);
  };

  const onError = (error: string) => {
    setIsLoading(false);
    setHasError(true);
    setVideoIsPlaying(false);
    setErrorMessage(error);
  };


  // Calculate responsive dimensions - use provided height from style or default responsive height
  const defaultHeight = screenWidth * 0.6; // 16:10 aspect ratio for better viewing
  const containerHeight = compact && style?.height ? style.height : (style?.height || defaultHeight);

  // Optimized smoothing for better performance
  const smoothedPersons = useSmoothedBboxes(peopleDetection.detectedPersons, 3);

  return (
    <ThemedView style={[styles.container, style]}>
      <View style={[
        styles.videoContainer, 
        { height: containerHeight },
        compact && {
          position: 'relative',
          borderRadius: Layout.borderRadius.md,
          backgroundColor: '#000',
          minHeight: 160, // Ensure minimum height for compact mode
        }
      ]}>
        {/* Always show the video component - this was working before */}
        <Video
          ref={videoRef}
          source={{ uri: hlsUrl }}
          style={[
            styles.video, 
            { 
              height: containerHeight,
              width: '100%'
            },
            compact && {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: Layout.borderRadius.md
            }
          ]}
          useNativeControls={!compact} // Disable native controls in compact mode for cards
          resizeMode={compact ? ResizeMode.COVER : ResizeMode.CONTAIN} // Use cover in compact mode
          isLooping={false}
          shouldPlay={true}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
          onLoadStart={onLoadStart}
          onError={onError}
        />

        {/* People Detection Overlay */}
        {enablePeopleDetection && showPeopleCounter && !hasError && videoIsPlaying && (
          <View style={styles.detectionOverlay}>
            {/* Frame Processing Debug Info */}
            {/* Detection bounding boxes removed for cleaner UI */}
          </View>
        )}

        {/* Live indicator - show when effectively connected or when video is loading/playing */}
        {(effectiveConnectionStatus === 'connected' || (!hasError && !isLoading)) && (
          <View style={styles.liveIndicator}>
            <View style={[styles.liveDot, { backgroundColor: successColor }]} />
            <ThemedText style={[styles.liveText, { color: '#fff' }]}>LIVE</ThemedText>
          </View>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={[styles.loadingText, { color: textColor }]}> 
              Loading live stream...
            </ThemedText>
          </View>
        )}

        {/* Error overlay */}
        {hasError && (
          <View style={styles.errorOverlay}>
            <Ionicons name="warning-outline" size={48} color={errorColor} />
            <ThemedText style={[styles.errorText, { color: errorColor }]}> 
              Stream Unavailable
            </ThemedText>
            <ThemedText style={[styles.errorDetails, { color: subtleTextColor }]}> 
              {errorMessage || 'Unable to load video stream'}
            </ThemedText>
          </View>
        )}
      </View>

      {/* People Detection Counter (when not compact) */}
      {enablePeopleDetection && !compact && (
        <PeopleCounter
          count={peopleDetection.peopleCount}
          detectedPersons={peopleDetection.detectedPersons}
          isActive={peopleDetection.isDetecting}
          isInitializing={!peopleDetection.isInitialized}
          error={peopleDetection.error}
          stats={peopleDetection.stats || undefined}
          showStats={true}
          onToggleDetection={() => {
            if (peopleDetection.isDetecting) {
              peopleDetection.stopDetection();
            } else {
              peopleDetection.startDetection();
            }
          }}
          style={{ marginTop: Layout.spacing.md }}
        />
      )}
      
      {/* Camera info */}
      <ThemedView style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <Ionicons name="videocam" size={16} color={tintColor} />
          <ThemedText style={[styles.cameraName, { color: textColor }]}>
            {camera.name}
          </ThemedText>
        </View>
        <View style={styles.infoRow}>
          <Ionicons 
            name={effectiveConnectionStatus === 'connected' ? 'wifi' : 'wifi-outline'} 
            size={14} 
            color={effectiveConnectionStatus === 'connected' ? successColor : errorColor} 
          />
          <ThemedText style={[styles.statusText, { 
            color: effectiveConnectionStatus === 'connected' ? successColor : 
                   databaseConnectionStatus === 'testing' ? tintColor : errorColor 
          }]}>
            {effectiveConnectionStatus === 'connected' ? 'Connected' : 
             databaseConnectionStatus === 'testing' ? 'Testing...' : 'Disconnected'}
          </ThemedText>
        </View>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  videoContainer: {
    width: '100%',
    position: 'relative',
    borderRadius: Layout.borderRadius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  video: {
    width: '100%',
    backgroundColor: '#000',
  },
  liveIndicator: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.9)',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#fff',
    marginRight: Layout.spacing.xs,
  },
  liveText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    letterSpacing: 0.5,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  errorText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    marginTop: Layout.spacing.sm,
  },
  errorDetails: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: Layout.spacing.xs,
    lineHeight: 20,
  },
  infoContainer: {
    backgroundColor: 'transparent',
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    marginTop: Layout.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  cameraName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  statusText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.sm,
  },
  detectionOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'box-none', // Allow touches to pass through to video
  },
  peopleCounterOverlay: {
    position: 'absolute',
    top: Layout.spacing.sm,
    right: Layout.spacing.sm,
    zIndex: 10,
  },
  overlayCounter: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: Layout.borderRadius.md,
  },
  boundingBox: {
    position: 'absolute',
    borderWidth: 2,
    borderStyle: 'solid',
    borderRadius: 4,
  },
  confidenceLabel: {
    position: 'absolute',
    top: -20,
    left: 0,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  confidenceText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Bold',
    color: '#fff',
  },
  toggleDetectionButton: {
    position: 'absolute',
    bottom: Layout.spacing.sm,
    right: Layout.spacing.sm,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  frameDebugInfo: {
    position: 'absolute',
    top: Layout.spacing.sm,
    left: Layout.spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: Layout.borderRadius.sm,
    padding: Layout.spacing.xs,
    minWidth: 120,
  },
  debugText: {
    fontSize: 10,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'left',
  },
});
