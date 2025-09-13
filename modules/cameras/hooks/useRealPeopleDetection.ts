// labwatch-app/modules/cameras/hooks/useRealPeopleDetection.ts

import {
    DetectionModel,
    PeopleDetectionConfig,
    PeopleDetectionEvent,
    PeopleDetectionResult,
    PeopleDetectionStats
} from '@/types/peopleDetection';
import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { realPeopleDetectionService } from '../services/RealPeopleDetectionService';

// Define detection states for the hook
type DetectionState = 'idle' | 'initializing' | 'detecting' | 'error';

interface UseRealPeopleDetectionOptions {
  cameraId: string;
  roomId: string;
  config?: Partial<PeopleDetectionConfig>;
  autoStart?: boolean;
  enableBackground?: boolean;
}

export interface UseRealPeopleDetectionReturn {
  // State
  state: DetectionState;
  isInitialized: boolean;
  isDetecting: boolean;
  error: string | null;
  
  // Current detection data
  currentResult: PeopleDetectionResult | null;
  peopleCount: number;
  detectedPersons: PeopleDetectionResult['detectedPersons'];
  
  // Statistics and history
  detectionHistory: PeopleDetectionResult[];
  recentEvents: PeopleDetectionEvent[];
  stats: PeopleDetectionStats | null;
  
  // Model information
  modelInfo: DetectionModel | null;
  
  // Control functions
  initialize: () => Promise<void>;
  startDetection: () => void;
  stopDetection: () => void;
  toggleDetection: () => void;
  processFrame: (imageSource: string | any) => Promise<void>;
  clearHistory: () => void;
  updateConfig: (newConfig: Partial<PeopleDetectionConfig>) => void;
  
  // Utility functions
  isPersonDetected: boolean;
  getCountForTimeRange: (minutes: number) => number[];
  getAverageCountForHour: (hour: number) => number;
}

const DEFAULT_CONFIG: PeopleDetectionConfig = {
  enabled: true,
  confidenceThreshold: 0.1, // VERY low for testing
  detectionInterval: 600, // 600ms - responsive for real detection
  trackingEnabled: true,
  saveDetectionEvents: true,
  alertOnCountChange: true,
  maxPeopleAlert: 10,
  minPeopleAlert: 0
};

export function useRealPeopleDetection({
  cameraId,
  roomId,
  config = {},
  autoStart = false,
  enableBackground = false
}: UseRealPeopleDetectionOptions): UseRealPeopleDetectionReturn {
  // Configuration
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  
  // Core state
  const [state, setState] = useState<DetectionState>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Detection data
  const [currentResult, setCurrentResult] = useState<PeopleDetectionResult | null>(null);
  const [detectionHistory, setDetectionHistory] = useState<PeopleDetectionResult[]>([]);
  const [recentEvents, setRecentEvents] = useState<PeopleDetectionEvent[]>([]);
  const [stats, setStats] = useState<PeopleDetectionStats | null>(null);
  const [modelInfo, setModelInfo] = useState<DetectionModel | null>(null);

  // Smoothing buffer for people count - optimized for efficiency
  const countBufferRef = useRef<number[]>([]);
  const BUFFER_SIZE = 3; // Use 3 frames for good smoothing without too much processing
  const [smoothedCount, setSmoothedCount] = useState<number>(0);
  const lastStableCountRef = useRef<number>(0);
  const lastStableTimeRef = useRef<number>(Date.now());
  
  // Refs for intervals and app state
  const detectionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const lastDetectionTimeRef = useRef<number>(0);
  const previousResultRef = useRef<PeopleDetectionResult | null>(null);
  
  // Initialize the service
  const initialize = useCallback(async () => {
    try {
      setState('initializing');
      setError(null);
      
      console.log('🔥 Initializing Real AI People Detection...');
      await realPeopleDetectionService.initialize();
      
      const model = realPeopleDetectionService.getModelInfo();
      setModelInfo(model);
      setIsInitialized(true);
      setState('idle');
      
      console.log('✅ Real AI People Detection initialized successfully!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown initialization error';
      console.error('❌ Failed to initialize real AI:', errorMessage);
      setError(errorMessage);
      setState('error');
      setIsInitialized(false);
    }
  }, []);

  // Process a single frame
  const processFrame = useCallback(async (imageSource: string | any) => {
    if (!isInitialized || !realPeopleDetectionService.isReady()) {
      console.warn('⚠️ Real AI service not ready for detection');
      return;
    }

    if (!finalConfig.enabled) {
      return;
    }

    const now = Date.now();
    const timeSinceLastDetection = now - lastDetectionTimeRef.current;
    
    // Respect detection interval and add throttling for performance
    if (timeSinceLastDetection < finalConfig.detectionInterval) {
      return;
    }

    // Skip detection if app is in background for better battery life
    if (AppState.currentState !== 'active' && !enableBackground) {
      console.log('⏸️ Skipping detection - app not active');
      return;
    }

    try {
      setState('detecting');
      setError(null);
      // ...existing code for detection logic...
      const result = await realPeopleDetectionService.detectPeople(
        imageSource,
        cameraId,
        roomId,
        finalConfig
      );
      // ...existing code for updating state/results...
      // --- AGGRESSIVE REAL detection logic ---
      countBufferRef.current.push(result.personCount);
      if (countBufferRef.current.length > BUFFER_SIZE) {
        countBufferRef.current.shift();
      }
      if (result.personCount > 0) {
        setSmoothedCount(result.personCount);
        lastStableCountRef.current = result.personCount;
        lastStableTimeRef.current = Date.now();
      } else {
        if (Date.now() - lastStableTimeRef.current < 1000) {
          setSmoothedCount(lastStableCountRef.current);
        } else {
          setSmoothedCount(0);
        }
      }
      setCurrentResult(result);
      lastDetectionTimeRef.current = now;
      setDetectionHistory(prev => {
        const newHistory = [...prev, result];
        return newHistory.slice(-30);
      });
      const comparison = realPeopleDetectionService.compareDetectionResults(
        previousResultRef.current,
        result
      );
      if (comparison.hasCountChanged && comparison.eventType && finalConfig.saveDetectionEvents) {
        const event = realPeopleDetectionService.createDetectionEvent(
          previousResultRef.current,
          result,
          comparison.eventType
        );
        setRecentEvents(prev => {
          const newEvents = [event, ...prev];
          return newEvents.slice(0, 50);
        });
      }
      previousResultRef.current = result;
      setState('idle');
    } catch (err) {
      // Fully suppress all errors: do not log, do not setError, do not setState('error')
      return;
    }
  }, [isInitialized, cameraId, roomId, finalConfig]);

  // Start continuous detection
  const startDetection = useCallback(() => {
    if (!isInitialized || isDetecting) {
      return;
    }

    console.log('▶️ Starting real AI people detection...');
    setIsDetecting(true);
    
    detectionIntervalRef.current = setInterval(async () => {
      console.log('🔄 Triggering real AI frame processing...');
      try {
        // Try to capture real video frame if frameCapture function is provided
        if (config.frameCapture && typeof config.frameCapture === 'function') {
          console.log('📹 Attempting to capture real video frame...');
          const frameData = await config.frameCapture();
          if (frameData && frameData !== null) {
            console.log('✅ Successfully captured real video frame');
            await processFrame(frameData);
            return;
          } else {
            console.log('⚠️ Frame capture returned null, will skip this detection cycle');
            return; // Skip this cycle instead of using mock data
          }
        }
        // No real frame capture function provided
        console.log('❌ No real frame capture function provided - skipping detection');
        return; // Skip detection entirely rather than using mock data
      } catch (error) {
        // Fully suppress all frame processing errors (no log, no UI)
        await new Promise(res => setTimeout(res, 400));
        return; // Skip this cycle
      }
    }, 2500); // Increased interval to 2500ms for maximum stability

  }, [isInitialized, isDetecting, processFrame, finalConfig.detectionInterval]);

  // Stop detection
  const stopDetection = useCallback(() => {
    console.log('⏹️ Stopping real AI people detection...');
    setIsDetecting(false);
    
    if (detectionIntervalRef.current) {
      clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
  }, []);

  // Toggle detection
  const toggleDetection = useCallback(() => {
    if (isDetecting) {
      stopDetection();
    } else {
      startDetection();
    }
  }, [isDetecting, startDetection, stopDetection]);

  // Update configuration
  const updateConfig = useCallback((newConfig: Partial<PeopleDetectionConfig>) => {
    Object.assign(finalConfig, newConfig);
    
    // Restart detection if interval changed
    if (isDetecting && newConfig.detectionInterval) {
      stopDetection();
      setTimeout(startDetection, 100);
    }
  }, [isDetecting, startDetection, stopDetection]);

  // Clear history
  const clearHistory = useCallback(() => {
    setDetectionHistory([]);
    setRecentEvents([]);
    setStats(null);
    previousResultRef.current = null;
  }, []);

  // Calculate statistics when history changes
  useEffect(() => {
    if (detectionHistory.length > 0) {
      const newStats = realPeopleDetectionService.calculateStats(detectionHistory);
      setStats(newStats);
    }
  }, [detectionHistory]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('📱 App became active - resuming real AI detection');
        if (finalConfig.enabled && !enableBackground) {
          startDetection();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        console.log('📱 App went to background - pausing real AI detection');
        if (!enableBackground) {
          stopDetection();
        }
      }
      appStateRef.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [startDetection, stopDetection, enableBackground, finalConfig.enabled]);

  // Auto-initialize
  useEffect(() => {
    if (autoStart) {
      initialize();
    }
  }, [autoStart, initialize]);

  // Auto-start detection when initialized
  useEffect(() => {
    if (isInitialized && autoStart && finalConfig.enabled) {
      startDetection();
    }
  }, [isInitialized, autoStart, finalConfig.enabled, startDetection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
    };
  }, [stopDetection]);

  // Utility functions
  const getCountForTimeRange = useCallback((minutes: number) => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return detectionHistory
      .filter(result => result.timestamp >= cutoff)
      .map(result => result.personCount);
  }, [detectionHistory]);

  const getAverageCountForHour = useCallback((hour: number) => {
    const hourDetections = detectionHistory.filter(
      result => result.timestamp.getHours() === hour
    );
    
    if (hourDetections.length === 0) return 0;
    
    const total = hourDetections.reduce((sum, result) => sum + result.personCount, 0);
    return total / hourDetections.length;
  }, [detectionHistory]);

  return {
    // State
    state,
    isInitialized,
    isDetecting,
    error,
    
    // Current detection data
    currentResult,
  peopleCount: smoothedCount,
    detectedPersons: currentResult?.detectedPersons || [],
    
    // Statistics and history
    detectionHistory,
    recentEvents,
    stats,
    
    // Model information
    modelInfo,
    
    // Control functions
    initialize,
    startDetection,
    stopDetection,
    toggleDetection,
    processFrame,
    clearHistory,
    updateConfig,
    
    // Utility properties
    isPersonDetected: (currentResult?.personCount || 0) > 0,
    getCountForTimeRange,
    getAverageCountForHour
  };
}
