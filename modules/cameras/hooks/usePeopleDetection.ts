// labwatch-app/modules/cameras/hooks/usePeopleDetection.ts

import {
    DetectedPerson,
    PeopleDetectionConfig,
    PeopleDetectionResult,
    PeopleDetectionState
} from '@/types/peopleDetection';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraService } from '../services/CameraService';
import { peopleDetectionService } from '../services/PeopleDetectionService';

interface UsePeopleDetectionOptions {
  cameraId: string;
  roomId: string;
  config?: Partial<PeopleDetectionConfig>;
  autoStart?: boolean;
  onCountChange?: (current: number, previous: number) => void;
  onPersonEntered?: (count: number) => void;
  onPersonExited?: (count: number) => void;
  onError?: (error: string) => void;
}

interface UsePeopleDetectionReturn {
  state: PeopleDetectionState;
  currentCount: number;
  detectedPersons: DetectedPerson[];
  isActive: boolean;
  isInitializing: boolean;
  error: string | null;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  processFrame: (videoElement: HTMLVideoElement) => Promise<PeopleDetectionResult | null>;
  updateConfig: (newConfig: Partial<PeopleDetectionConfig>) => void;
  getStats: () => any;
  clearHistory: () => void;
}

export function usePeopleDetection({
  cameraId,
  roomId,
  config = {},
  autoStart = false,
  onCountChange,
  onPersonEntered,
  onPersonExited,
  onError
}: UsePeopleDetectionOptions): UsePeopleDetectionReturn {
  
  const [state, setState] = useState<PeopleDetectionState>({
    isActive: false,
    isInitializing: false,
    model: null,
    currentCount: 0,
    detectedPersons: [],
    lastDetection: null,
    error: null,
    config: {
      enabled: true,
      confidenceThreshold: 0.5,
      detectionInterval: 1000,
      trackingEnabled: true,
      saveDetectionEvents: true,
      alertOnCountChange: true,
      maxPeopleAlert: 10,
      minPeopleAlert: 0,
      ...config
    },
    stats: {
      totalDetections: 0,
      averageCount: 0,
      maxCount: 0,
      minCount: 0,
      lastDetection: new Date(),
      detectionAccuracy: 0,
      busyHours: []
    }
  });

  // Store detection history
  const detectionHistory = useRef<PeopleDetectionResult[]>([]);
  const lastDetectionResult = useRef<PeopleDetectionResult | null>(null);
  const detectionInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const videoElement = useRef<HTMLVideoElement | null>(null);

  // Initialize the detection service
  const initializeService = useCallback(async () => {
    if (peopleDetectionService.isReady()) {
      return;
    }

    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      await peopleDetectionService.initialize();
      const modelInfo = peopleDetectionService.getModelInfo();
      
      setState(prev => ({
        ...prev,
        isInitializing: false,
        model: modelInfo,
        error: null
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to initialize people detection';
      setState(prev => ({
        ...prev,
        isInitializing: false,
        error: errorMessage
      }));
      onError?.(errorMessage);
      throw error;
    }
  }, [onError]);

  // Process a single frame
  const processFrame = useCallback(async (
    video: HTMLVideoElement
  ): Promise<PeopleDetectionResult | null> => {
    if (!peopleDetectionService.isReady() || !state.config.enabled) {
      return null;
    }

    try {
      const result = await peopleDetectionService.processVideoFrame(
        video,
        cameraId,
        roomId,
        state.config
      );

      // Update detection history
      detectionHistory.current.push(result);
      
      // Keep only last 1000 detections to prevent memory issues
      if (detectionHistory.current.length > 1000) {
        detectionHistory.current = detectionHistory.current.slice(-1000);
      }

      // Compare with previous result
      const comparison = peopleDetectionService.compareDetectionResults(
        lastDetectionResult.current,
        result
      );

      // Update state
      setState(prev => ({
        ...prev,
        currentCount: result.personCount,
        detectedPersons: result.detectedPersons,
        lastDetection: result.timestamp,
        error: null,
        stats: peopleDetectionService.calculateStats(detectionHistory.current)
      }));

      // Trigger callbacks if count changed
      if (comparison.hasCountChanged) {
        const previousCount = lastDetectionResult.current?.personCount || 0;
        
        onCountChange?.(result.personCount, previousCount);
        
        if (comparison.eventType === 'person_entered') {
          onPersonEntered?.(result.personCount);
        } else if (comparison.eventType === 'person_exited') {
          onPersonExited?.(result.personCount);
        }

        // Save detection event if configured
        if (state.config.saveDetectionEvents && comparison.eventType) {
          try {
            const event = peopleDetectionService.createDetectionEvent(
              lastDetectionResult.current,
              result,
              comparison.eventType
            );
            
            // Add to camera events (you may want to create a separate collection for people detection events)
            await CameraService.addCameraEvent({
              cameraId,
              roomId,
              type: 'motion_detected', // Using existing type, could extend for people detection
              details: `People count changed: ${previousCount} → ${result.personCount}`,
            });
          } catch (error) {
            console.error('Failed to save detection event:', error);
          }
        }
      }

      lastDetectionResult.current = result;
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Detection failed';
      setState(prev => ({ ...prev, error: errorMessage }));
      onError?.(errorMessage);
      return null;
    }
  }, [cameraId, roomId, state.config, onCountChange, onPersonEntered, onPersonExited, onError]);

  // Start detection with automatic frame processing
  const startDetection = useCallback(async () => {
    if (state.isActive) {
      return;
    }

    try {
      await initializeService();
      
      setState(prev => ({ ...prev, isActive: true, error: null }));

      // If we have a video element, start automatic detection
      if (videoElement.current) {
        detectionInterval.current = setInterval(() => {
          if (videoElement.current && state.isActive) {
            processFrame(videoElement.current);
          }
        }, state.config.detectionInterval);
      }
    } catch (error) {
      setState(prev => ({ ...prev, isActive: false }));
      throw error;
    }
  }, [state.isActive, state.config.detectionInterval, initializeService, processFrame]);

  // Stop detection
  const stopDetection = useCallback(() => {
    if (detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = null;
    }

    setState(prev => ({
      ...prev,
      isActive: false,
      currentCount: 0,
      detectedPersons: [],
      error: null
    }));
  }, []);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<PeopleDetectionConfig>) => {
    setState(prev => ({
      ...prev,
      config: { ...prev.config, ...newConfig }
    }));

    // Restart detection with new interval if needed
    if (state.isActive && newConfig.detectionInterval && detectionInterval.current) {
      clearInterval(detectionInterval.current);
      detectionInterval.current = setInterval(() => {
        if (videoElement.current && state.isActive) {
          processFrame(videoElement.current);
        }
      }, newConfig.detectionInterval);
    }
  }, [state.isActive, processFrame]);

  // Get statistics
  const getStats = useCallback(() => {
    return peopleDetectionService.calculateStats(detectionHistory.current);
  }, []);

  // Clear detection history
  const clearHistory = useCallback(() => {
    detectionHistory.current = [];
    lastDetectionResult.current = null;
    setState(prev => ({
      ...prev,
      stats: {
        totalDetections: 0,
        averageCount: 0,
        maxCount: 0,
        minCount: 0,
        lastDetection: new Date(),
        detectionAccuracy: 0,
        busyHours: []
      }
    }));
  }, []);

  // Auto-start if enabled
  useEffect(() => {
    if (autoStart && !state.isActive && !state.isInitializing) {
      startDetection().catch(error => {
        console.error('Auto-start detection failed:', error);
      });
    }
  }, [autoStart, state.isActive, state.isInitializing, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Update video element reference for automatic detection
  const setVideoElement = useCallback((video: HTMLVideoElement | null) => {
    videoElement.current = video;
  }, []);

  return {
    state,
    currentCount: state.currentCount,
    detectedPersons: state.detectedPersons,
    isActive: state.isActive,
    isInitializing: state.isInitializing,
    error: state.error,
    startDetection,
    stopDetection,
    processFrame,
    updateConfig,
    getStats,
    clearHistory,
    // Additional utility
    setVideoElement
  } as UsePeopleDetectionReturn & { setVideoElement: (video: HTMLVideoElement | null) => void };
}
