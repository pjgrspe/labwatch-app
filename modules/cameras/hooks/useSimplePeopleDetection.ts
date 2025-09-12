// labwatch-app/modules/cameras/hooks/useSimplePeopleDetection.ts

import {
    DetectedPerson,
    PeopleDetectionConfig,
    PeopleDetectionResult,
    PeopleDetectionState
} from '@/types/peopleDetection';
import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraService } from '../services/CameraService';
import { simplePeopleDetectionService } from '../services/SimplePeopleDetectionService';

interface UseSimplePeopleDetectionOptions {
  cameraId: string;
  roomId: string;
  config?: Partial<PeopleDetectionConfig>;
  autoStart?: boolean;
  onCountChange?: (current: number, previous: number) => void;
  onPersonEntered?: (count: number) => void;
  onPersonExited?: (count: number) => void;
  onError?: (error: string) => void;
}

interface UseSimplePeopleDetectionReturn {
  state: PeopleDetectionState;
  currentCount: number;
  detectedPersons: DetectedPerson[];
  isActive: boolean;
  isInitializing: boolean;
  error: string | null;
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  processFrame: (videoElement: any) => Promise<PeopleDetectionResult | null>;
  updateConfig: (newConfig: Partial<PeopleDetectionConfig>) => void;
  getStats: () => any;
  clearHistory: () => void;
}

export function useSimplePeopleDetection({
  cameraId,
  roomId,
  config = {},
  autoStart = false,
  onCountChange,
  onPersonEntered,
  onPersonExited,
  onError
}: UseSimplePeopleDetectionOptions): UseSimplePeopleDetectionReturn {
  
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
      detectionInterval: 3000, // 3 seconds for demo
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

  // Initialize the detection service
  const initializeService = useCallback(async () => {
    if (simplePeopleDetectionService.isReady()) {
      return;
    }

    setState(prev => ({ ...prev, isInitializing: true, error: null }));

    try {
      await simplePeopleDetectionService.initialize();
      const modelInfo = simplePeopleDetectionService.getModelInfo();
      
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
    videoElement: any
  ): Promise<PeopleDetectionResult | null> => {
    if (!simplePeopleDetectionService.isReady() || !state.config.enabled) {
      return null;
    }

    try {
      const result = await simplePeopleDetectionService.processVideoFrame(
        videoElement,
        cameraId,
        roomId,
        state.config
      );

      // Update detection history
      detectionHistory.current.push(result);
      
      // Keep only last 1000 detections
      if (detectionHistory.current.length > 1000) {
        detectionHistory.current = detectionHistory.current.slice(-1000);
      }

      // Compare with previous result
      const comparison = simplePeopleDetectionService.compareDetectionResults(
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
        stats: simplePeopleDetectionService.calculateStats(detectionHistory.current)
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
            const event = simplePeopleDetectionService.createDetectionEvent(
              lastDetectionResult.current,
              result,
              comparison.eventType
            );
            
            // Add to camera events
            await CameraService.addCameraEvent({
              cameraId,
              roomId,
              type: 'people_detected',
              details: `People count changed: ${previousCount} → ${result.personCount}`,
              peopleCount: result.personCount
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

      // Start automatic detection with mock data
      detectionInterval.current = setInterval(async () => {
        if (state.isActive) {
          await processFrame(null); // Mock doesn't need actual video element
        }
      }, state.config.detectionInterval);
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
      detectionInterval.current = setInterval(async () => {
        if (state.isActive) {
          await processFrame(null);
        }
      }, newConfig.detectionInterval);
    }
  }, [state.isActive, processFrame]);

  // Get statistics
  const getStats = useCallback(() => {
    return simplePeopleDetectionService.calculateStats(detectionHistory.current);
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
    clearHistory
  };
}
