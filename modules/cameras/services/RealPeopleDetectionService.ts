// labwatch-app/modules/cameras/services/RealPeopleDetectionService.ts

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
import { Platform } from 'react-native';
import { CameraFrameProcessor } from './CameraFrameProcessor';
import { initializeTensorFlowPlatform, isPlatformInitialized } from './TensorFlowPlatformSetup';

export class RealPeopleDetectionService {
  private static instance: RealPeopleDetectionService;
  private model: cocoSsd.ObjectDetection | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  // Default configuration - very aggressive for testing
  private defaultConfig: PeopleDetectionConfig = {
    enabled: true,
    confidenceThreshold: 0.1, // EXTREMELY low for testing
    detectionInterval: 600, // Fast for real detection
    trackingEnabled: true,
    saveDetectionEvents: true,
    alertOnCountChange: true,
    maxPeopleAlert: 10,
    minPeopleAlert: 0
  };

  private constructor() {}

  public static getInstance(): RealPeopleDetectionService {
    if (!RealPeopleDetectionService.instance) {
      RealPeopleDetectionService.instance = new RealPeopleDetectionService();
    }
    return RealPeopleDetectionService.instance;
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
      console.log('🚀 Initializing Real AI People Detection Service...');
      
      // Initialize TensorFlow.js platform first
      await initializeTensorFlowPlatform();
      
      if (!isPlatformInitialized()) {
        throw new Error('TensorFlow.js platform failed to initialize');
      }

      console.log('📥 Loading COCO-SSD model with optimized settings...');
      
      // Load the COCO-SSD model with specific configuration for better stationary person detection
      this.model = await cocoSsd.load({
        base: 'mobilenet_v2', // Use MobileNet v2 for better performance on mobile
        modelUrl: undefined // Use default model for best accuracy
      });

      this.isInitialized = true;
      console.log('✅ Real AI People Detection Service initialized successfully!');
      console.log('🔧 Model info:', {
        backend: tf.getBackend(),
        memory: tf.memory()
      });
    } catch (error) {
      console.error('❌ Failed to initialize real people detection service:', error);
      this.isInitialized = false;
      throw new Error(`Real AI initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Detect people in an image
   * Enhanced version using CameraFrameProcessor for React Native compatibility
   */
  public async detectPeople(
    imageSource: string | tf.Tensor3D,
    cameraId: string,
    roomId: string,
    config: Partial<PeopleDetectionConfig> = {}
  ): Promise<PeopleDetectionResult> {
    if (!this.isInitialized || !this.model) {
      throw new Error('Real AI service not initialized');
    }

    const finalConfig = { ...this.defaultConfig, ...config };
    const startTime = Date.now();

    try {
      console.log('🔍 Running real AI people detection with enhanced frame processing...');
      console.log('📷 Processing camera frame URI:', typeof imageSource === 'string' ? imageSource : 'tensor');

      let tensor: tf.Tensor3D;
      let shouldDispose = false;
      let frameId: string | undefined;

      // Handle different input types using CameraFrameProcessor
      if (typeof imageSource === 'string') {
        frameId = imageSource; // Store the frame URI as frameId
        console.log('🔄 Converting snapshot URL to tensor...');
        console.log('📸 Snapshot URL:', imageSource.substring(0, 100) + '...');
        
        // Convert URI/base64 to tensor using frame processor
        const processedTensor = await CameraFrameProcessor.uriToTensor(imageSource);
        if (!processedTensor) {
          console.error('❌ Failed to process image source - no tensor returned');
          console.log('⚠️ This could be due to:');
          console.log('   - Network connectivity issues');
          console.log('   - Snapshot proxy not responding');
          console.log('   - Invalid camera credentials');
          console.log('   - Camera not accessible');
          console.log('   - FFmpeg not available on proxy server');
          
          // Instead of throwing, return empty result for now
          return {
            personCount: 0,
            detectedPersons: [],
            timestamp: new Date(),
            cameraId,
            roomId,
            frameWidth: 0,
            frameHeight: 0,
            processingTime: Date.now() - startTime,
            frameId
          };
        }
        console.log('✅ Successfully converted to tensor:', processedTensor.shape);
        tensor = processedTensor;
        shouldDispose = true;
      } else {
        // Already a tensor
        tensor = imageSource;
        frameId = `tensor_${Date.now()}`;
      }

      const frameWidth = tensor.shape[1];
      const frameHeight = tensor.shape[0];

      console.log(`📷 Processing frame: ${frameWidth}x${frameHeight}`);

      // Preprocess tensor for COCO-SSD
      const preprocessedTensor = CameraFrameProcessor.preprocessForCOCOSSD(tensor);

      // Run object detection on the tensor
      console.log('🧠 Running COCO-SSD inference...');
      const predictions = await this.model.detect(preprocessedTensor);
      
      console.log(`🎯 COCO-SSD found ${predictions.length} objects total`);

      // Filter for people only and apply confidence threshold
      const peoplePredictions = predictions.filter(
        prediction => 
          prediction.class === 'person' && 
          prediction.score >= finalConfig.confidenceThreshold
      );

      console.log(`👤 Filtered to ${peoplePredictions.length} people with confidence > ${finalConfig.confidenceThreshold}`);
      
      // Log all predictions for debugging
      if (predictions.length > 0) {
        console.log('🔍 All COCO-SSD predictions:', predictions.map(p => ({
          class: p.class,
          score: p.score.toFixed(3),
          bbox: p.bbox.map(b => Math.round(b))
        })));
      }
      
      // Log people predictions specifically
      if (peoplePredictions.length > 0) {
        console.log('🎯 People predictions:', peoplePredictions.map(p => ({
          confidence: p.score.toFixed(3),
          bbox: p.bbox.map(b => Math.round(b))
        })));
      } else {
        console.log('❌ No people detected above confidence threshold', finalConfig.confidenceThreshold);
      }

      // Convert predictions to DetectedPerson objects
      const detectedPersons: DetectedPerson[] = peoplePredictions.map((prediction, index) => ({
        id: `real_${cameraId}_${Date.now()}_${index}`,
        bbox: prediction.bbox,
        confidence: prediction.score,
        timestamp: new Date(),
        trackingId: finalConfig.trackingEnabled ? this.generateTrackingId(prediction) : undefined
      }));

      const processingTime = Date.now() - startTime;

      const result: PeopleDetectionResult = {
        personCount: detectedPersons.length,
        detectedPersons,
        timestamp: new Date(),
        cameraId,
        roomId,
        frameWidth,
        frameHeight,
        processingTime,
        frameId // Include the frame identifier
      };

      console.log(`✅ Real AI detection completed in ${processingTime}ms - Found ${result.personCount} people`);

      // Log tensor info for debugging
      const tensorInfo = CameraFrameProcessor.getTensorInfo(tensor);
      console.log('🔧 Tensor info:', tensorInfo);

      // Clean up tensors if we created them
      if (shouldDispose) {
        CameraFrameProcessor.disposeTensor(tensor);
      }
      if (preprocessedTensor !== tensor) {
        CameraFrameProcessor.disposeTensor(preprocessedTensor);
      }

      // Log memory usage
      const memoryInfo = tf.memory();
      console.log('🧠 TensorFlow memory:', {
        numTensors: memoryInfo.numTensors,
        numBytes: Math.round(memoryInfo.numBytes / 1024) + 'KB'
      });

      return result;
    } catch (error) {
      console.error('❌ Error during real AI people detection:', error);
      throw error;
    }
  }

  /**
   * Convert base64 image to tensor
   */
  private async base64ToTensor(base64: string): Promise<tf.Tensor3D> {
    try {
      // Remove data URL prefix if present
      const base64Data = base64.replace(/^data:image\/[a-z]+;base64,/, '');
      
      // For React Native, we'll need to decode the base64 image
      // This is a simplified version - in production you'd use proper image decoding
      
      // Create a mock tensor for now - this would need proper image decoding
      // In a real implementation, you'd use react-native-image-manipulator or similar
      const mockTensor = tf.randomUniform([480, 640, 3], 0, 255, 'int32') as tf.Tensor3D;
      
      console.log('📷 Converted base64 to tensor:', mockTensor.shape);
      return mockTensor;
    } catch (error) {
      console.error('❌ Failed to convert base64 to tensor:', error);
      throw error;
    }
  }

  /**
   * Process a video frame - enhanced for React Native with frame processor
   */
  public async processVideoFrame(
    videoSource: any, // Camera snapshot URI, video element, or image data
    cameraId: string,
    roomId: string,
    config: Partial<PeopleDetectionConfig> = {}
  ): Promise<PeopleDetectionResult> {
    console.log('📹 Processing video frame with real AI (enhanced)...');
    
    try {
      // Handle different video source types
      if (typeof videoSource === 'string') {
        // URI or base64 string
        return this.detectPeople(videoSource, cameraId, roomId, config);
      } else if (Platform.OS === 'web' && videoSource instanceof HTMLVideoElement) {
        // Web video element
        const tensor = CameraFrameProcessor.captureVideoFrame(videoSource);
        if (!tensor) {
          throw new Error('Failed to capture video frame');
        }
        const result = await this.detectPeople(tensor, cameraId, roomId, config);
        CameraFrameProcessor.disposeTensor(tensor);
        return result;
      } else {
        // For now, generate a demonstration with mock data
        console.log('� Using mock frame for demonstration...');
        const mockTensor = this.createMockTensorWithPeople();
        const result = await this.detectPeople(mockTensor, cameraId, roomId, config);
        CameraFrameProcessor.disposeTensor(mockTensor);
        return result;
      }
    } catch (error) {
      console.error('❌ Failed to process video frame:', error);
      throw error;
    }
  }

  /**
   * Create a mock tensor that should trigger person detection
   */
  private createMockTensorWithPeople(): tf.Tensor3D {
    const width = 640;
    const height = 480;
    const channels = 3;
    
    // Create image data that resembles people for COCO-SSD
    const data = new Float32Array(width * height * channels);
    
    // Background
    for (let i = 0; i < data.length; i += 3) {
      data[i] = 200;     // R
      data[i + 1] = 200; // G 
      data[i + 2] = 200; // B
    }
    
    // Add person-like shapes that COCO-SSD should detect
    const persons = [
      { x: 150, y: 200, w: 80, h: 160 }, // Person 1
      { x: 400, y: 180, w: 70, h: 180 }, // Person 2
    ];
    
    persons.forEach((person, personIndex) => {
      for (let y = person.y; y < person.y + person.h && y < height; y++) {
        for (let x = person.x; x < person.x + person.w && x < width; x++) {
          const idx = (y * width + x) * channels;
          if (idx < data.length - 2) {
            // Create person-like colors (skin tones, clothing)
            if (y < person.y + person.h * 0.3) {
              // Head area - skin tone
              data[idx] = 220 + Math.random() * 20;     // R
              data[idx + 1] = 180 + Math.random() * 20; // G
              data[idx + 2] = 140 + Math.random() * 20; // B
            } else {
              // Body area - clothing
              const clothingColor = personIndex === 0 ? [50, 50, 150] : [150, 50, 50];
              data[idx] = clothingColor[0] + Math.random() * 30;
              data[idx + 1] = clothingColor[1] + Math.random() * 30;
              data[idx + 2] = clothingColor[2] + Math.random() * 30;
            }
          }
        }
      }
    });
    
    return tf.tensor3d(data, [height, width, channels]);
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
      id: `real_event_${current.cameraId}_${Date.now()}`,
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
      name: 'COCO-SSD (Real AI)',
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
export const realPeopleDetectionService = RealPeopleDetectionService.getInstance();
