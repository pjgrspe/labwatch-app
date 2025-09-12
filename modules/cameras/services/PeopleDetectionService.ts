// labwatch-app/modules/cameras/services/PeopleDetectionService.ts

import {
    DetectedPerson,
    DetectionModel,
    ModelPrediction,
    PeopleDetectionConfig,
    PeopleDetectionEvent,
    PeopleDetectionResult,
    PeopleDetectionStats
} from '@/types/peopleDetection';
import * as cocoSsd from '@tensorflow-models/coco-ssd';
import * as tf from '@tensorflow/tfjs';
import { initializeTensorFlowPlatform, isPlatformInitialized } from './TensorFlowPlatformSetup';

export class PeopleDetectionService {
  private static instance: PeopleDetectionService;
  private model: cocoSsd.ObjectDetection | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Default configuration
  private defaultConfig: PeopleDetectionConfig = {
    enabled: true,
    confidenceThreshold: 0.5,
    detectionInterval: 1000, // 1 second
    trackingEnabled: true,
    saveDetectionEvents: true,
    alertOnCountChange: true,
    maxPeopleAlert: 10,
    minPeopleAlert: 0
  };

  private constructor() {}

  public static getInstance(): PeopleDetectionService {
    if (!PeopleDetectionService.instance) {
      PeopleDetectionService.instance = new PeopleDetectionService();
    }
    return PeopleDetectionService.instance;
  }

  /**
   * Initialize TensorFlow.js and load the COCO-SSD model
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._performInitialization();
    return this.initializationPromise;
  }

  private async _performInitialization(): Promise<void> {
    try {
      console.log('Initializing TensorFlow.js for React Native...');
      
      // Initialize TensorFlow.js platform first
      await initializeTensorFlowPlatform();
      
      if (!isPlatformInitialized()) {
        throw new Error('TensorFlow.js platform failed to initialize');
      }

      console.log('Loading COCO-SSD model...');
      
      // Load the COCO-SSD model with specific configuration for mobile
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2', // Use MobileNet v2 for better performance on mobile
        modelUrl: undefined // Use default CDN
      });

      this.isInitialized = true;
      console.log('✅ People detection service initialized successfully');
      console.log('Model info:', {
        backend: tf.getBackend(),
        memory: tf.memory()
      });
    } catch (error) {
      console.error('❌ Failed to initialize people detection service:', error);
      this.isInitialized = false;
      throw new Error(`Initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect people in an image
   */
  public async detectPeople(
    imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement | tf.Tensor3D,
    cameraId: string,
    roomId: string,
    config: Partial<PeopleDetectionConfig> = {}
  ): Promise<PeopleDetectionResult> {
    if (!this.isInitialized || !this.model) {
      throw new Error('People detection service not initialized');
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    try {
      // Run object detection
      const predictions = await this.model.detect(imageElement);
      
      // Filter for people only and apply confidence threshold
      const peoplePredictions = predictions.filter(
        prediction => 
          prediction.class === 'person' && 
          prediction.score >= finalConfig.confidenceThreshold
      );

      // Convert predictions to DetectedPerson objects
      const detectedPersons: DetectedPerson[] = peoplePredictions.map((prediction, index) => ({
        id: `${cameraId}_${Date.now()}_${index}`,
        bbox: prediction.bbox,
        confidence: prediction.score,
        timestamp: new Date(),
        trackingId: finalConfig.trackingEnabled ? this.generateTrackingId(prediction) : undefined
      }));

      const processingTime = Date.now() - startTime;

      // Get image dimensions
      let frameWidth = 0;
      let frameHeight = 0;
      
      if (imageElement instanceof HTMLImageElement) {
        frameWidth = imageElement.naturalWidth;
        frameHeight = imageElement.naturalHeight;
      } else if (imageElement instanceof HTMLVideoElement) {
        frameWidth = imageElement.videoWidth;
        frameHeight = imageElement.videoHeight;
      } else if (imageElement instanceof HTMLCanvasElement) {
        frameWidth = imageElement.width;
        frameHeight = imageElement.height;
      } else if (imageElement instanceof tf.Tensor) {
        const shape = imageElement.shape;
        frameHeight = shape[0];
        frameWidth = shape[1];
      }

      const result: PeopleDetectionResult = {
        personCount: detectedPersons.length,
        detectedPersons,
        timestamp: new Date(),
        cameraId,
        roomId,
        frameWidth,
        frameHeight,
        processingTime
      };

      return result;
    } catch (error) {
      console.error('Error during people detection:', error);
      throw error;
    }
  }

  /**
   * Process a video frame for people detection
   */
  public async processVideoFrame(
    videoElement: HTMLVideoElement,
    cameraId: string,
    roomId: string,
    config: Partial<PeopleDetectionConfig> = {}
  ): Promise<PeopleDetectionResult> {
    // Create a canvas to capture the current video frame
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to create canvas context for video processing');
    }

    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    
    // Draw the current video frame to canvas
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    // Run detection on the canvas
    return this.detectPeople(canvas, cameraId, roomId, config);
  }

  /**
   * Compare two detection results to determine if there's a count change
   */
  public compareDetectionResults(
    previous: PeopleDetectionResult | null,
    current: PeopleDetectionResult
  ): {
    hasCountChanged: boolean;
    countDifference: number;
    eventType: 'person_entered' | 'person_exited' | 'count_changed' | null;
  } {
    if (!previous) {
      return {
        hasCountChanged: current.personCount > 0,
        countDifference: current.personCount,
        eventType: current.personCount > 0 ? 'person_entered' : null
      };
    }

    const countDifference = current.personCount - previous.personCount;
    const hasCountChanged = countDifference !== 0;

    let eventType: 'person_entered' | 'person_exited' | 'count_changed' | null = null;
    if (hasCountChanged) {
      if (countDifference > 0) {
        eventType = 'person_entered';
      } else if (countDifference < 0) {
        eventType = 'person_exited';
      } else {
        eventType = 'count_changed';
      }
    }

    return {
      hasCountChanged,
      countDifference,
      eventType
    };
  }

  /**
   * Generate a simple tracking ID based on position and size
   * This is a basic implementation - more sophisticated tracking would use
   * algorithms like SORT or DeepSORT
   */
  private generateTrackingId(prediction: ModelPrediction): string {
    const [x, y, width, height] = prediction.bbox;
    const centerX = x + width / 2;
    const centerY = y + height / 2;
    
    // Simple hash based on position and size
    const hash = Math.abs(
      Math.floor(centerX / 50) * 1000 +
      Math.floor(centerY / 50) * 100 +
      Math.floor(width / 100) * 10 +
      Math.floor(height / 100)
    );
    
    return `track_${hash}`;
  }

  /**
   * Calculate detection statistics
   */
  public calculateStats(
    detectionHistory: PeopleDetectionResult[],
    timeWindowHours: number = 24
  ): PeopleDetectionStats {
    if (detectionHistory.length === 0) {
      return {
        totalDetections: 0,
        averageCount: 0,
        maxCount: 0,
        minCount: 0,
        lastDetection: new Date(),
        detectionAccuracy: 0,
        busyHours: []
      };
    }

    // Filter to time window
    const cutoffTime = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);
    const recentDetections = detectionHistory.filter(d => d.timestamp >= cutoffTime);

    const counts = recentDetections.map(d => d.personCount);
    const confidences = recentDetections.flatMap(d => 
      d.detectedPersons.map(p => p.confidence)
    );

    // Calculate hourly patterns
    const hourlyData: { [hour: number]: number[] } = {};
    recentDetections.forEach(detection => {
      const hour = detection.timestamp.getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = [];
      }
      hourlyData[hour].push(detection.personCount);
    });

    const busyHours = Object.entries(hourlyData).map(([hour, counts]) => ({
      hour: parseInt(hour),
      averageCount: counts.reduce((sum, count) => sum + count, 0) / counts.length
    }));

    return {
      totalDetections: recentDetections.length,
      averageCount: counts.reduce((sum, count) => sum + count, 0) / counts.length,
      maxCount: Math.max(...counts),
      minCount: Math.min(...counts),
      lastDetection: recentDetections[recentDetections.length - 1]?.timestamp || new Date(),
      detectionAccuracy: confidences.length > 0 
        ? confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length 
        : 0,
      busyHours: busyHours.sort((a, b) => b.averageCount - a.averageCount)
    };
  }

  /**
   * Create a detection event from results comparison
   */
  public createDetectionEvent(
    previous: PeopleDetectionResult | null,
    current: PeopleDetectionResult,
    eventType: 'person_entered' | 'person_exited' | 'count_changed'
  ): PeopleDetectionEvent {
    return {
      id: `event_${current.cameraId}_${Date.now()}`,
      cameraId: current.cameraId,
      roomId: current.roomId,
      eventType,
      previousCount: previous?.personCount || 0,
      currentCount: current.personCount,
      timestamp: new Date(),
      detectionResult: current
    };
  }

  /**
   * Check if service is ready
   */
  public isReady(): boolean {
    return this.isInitialized && this.model !== null;
  }

  /**
   * Get model information
   */
  public getModelInfo(): DetectionModel | null {
    if (!this.model) {
      return null;
    }

    return {
      name: 'COCO-SSD',
      version: '2.2.2',
      isLoaded: this.isInitialized,
      supportedClasses: [
        'person', 'bicycle', 'car', 'motorcycle', 'airplane', 'bus', 'train', 'truck',
        'boat', 'traffic light', 'fire hydrant', 'stop sign', 'parking meter', 'bench',
        'bird', 'cat', 'dog', 'horse', 'sheep', 'cow', 'elephant', 'bear', 'zebra',
        'giraffe', 'backpack', 'umbrella', 'handbag', 'tie', 'suitcase', 'frisbee',
        'skis', 'snowboard', 'sports ball', 'kite', 'baseball bat', 'baseball glove',
        'skateboard', 'surfboard', 'tennis racket', 'bottle', 'wine glass', 'cup',
        'fork', 'knife', 'spoon', 'bowl', 'banana', 'apple', 'sandwich', 'orange',
        'broccoli', 'carrot', 'hot dog', 'pizza', 'donut', 'cake', 'chair', 'couch',
        'potted plant', 'bed', 'dining table', 'toilet', 'tv', 'laptop', 'mouse',
        'remote', 'keyboard', 'cell phone', 'microwave', 'oven', 'toaster', 'sink',
        'refrigerator', 'book', 'clock', 'vase', 'scissors', 'teddy bear', 'hair drier',
        'toothbrush'
      ]
    };
  }

  /**
   * Dispose of the model and free up memory
   */
  public dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.isInitialized = false;
    this.initializationPromise = null;
  }
}

// Export singleton instance
export const peopleDetectionService = PeopleDetectionService.getInstance();
