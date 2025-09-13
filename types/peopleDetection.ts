// labwatch-app/types/peopleDetection.ts

import * as tf from '@tensorflow/tfjs';

export interface DetectedPerson {
  id: string; // Unique identifier for tracking
  bbox: [number, number, number, number]; // [x, y, width, height] in pixels
  confidence: number; // Detection confidence score (0-1)
  timestamp: Date;
  trackingId?: string; // For person tracking across frames
}

export interface PeopleDetectionResult {
  personCount: number;
  detectedPersons: DetectedPerson[];
  timestamp: Date;
  cameraId: string;
  roomId: string;
  frameWidth: number;
  frameHeight: number;
  processingTime: number; // Time taken for detection in ms
  frameId?: string; // Identifier for the processed frame (to distinguish real vs mock)
}

export interface PeopleDetectionEvent {
  id: string;
  cameraId: string;
  roomId: string;
  eventType: 'person_entered' | 'person_exited' | 'count_changed';
  previousCount: number;
  currentCount: number;
  timestamp: Date;
  detectionResult: PeopleDetectionResult;
  snapshot?: string; // Base64 encoded image or URL
}

export interface PeopleCountHistory {
  id: string;
  cameraId: string;
  roomId: string;
  count: number;
  timestamp: Date;
  duration?: number; // How long this count was maintained (in seconds)
}

export interface PeopleDetectionConfig {
  enabled: boolean;
  confidenceThreshold: number; // Minimum confidence for detection (0-1)
  detectionInterval: number; // Interval between detections in ms
  trackingEnabled: boolean; // Enable person tracking across frames
  saveDetectionEvents: boolean; // Save detection events to database
  alertOnCountChange: boolean; // Send alerts when person count changes
  maxPeopleAlert?: number; // Alert when count exceeds this number
  minPeopleAlert?: number; // Alert when count goes below this number
  frameCapture?: () => Promise<string | tf.Tensor3D | null>; // Function to capture real video frames
}

export interface PeopleDetectionStats {
  totalDetections: number;
  averageCount: number;
  maxCount: number;
  minCount: number;
  lastDetection: Date;
  detectionAccuracy: number; // Estimated accuracy based on confidence scores
  busyHours: { hour: number; averageCount: number }[]; // Hourly activity patterns
}

export interface RoomOccupancy {
  roomId: string;
  roomName: string;
  currentCount: number;
  maxCapacity?: number;
  lastUpdated: Date;
  cameras: {
    cameraId: string;
    cameraName: string;
    count: number;
    isActive: boolean;
  }[];
  occupancyRate: number; // Percentage of max capacity
  status: 'empty' | 'low' | 'moderate' | 'high' | 'overcapacity';
}

// ML Model related types
export interface DetectionModel {
  name: string;
  version: string;
  isLoaded: boolean;
  loadTime?: number;
  modelSize?: number;
  supportedClasses: string[];
}

export interface ModelPrediction {
  class: string;
  score: number;
  bbox: [number, number, number, number];
}

// Real-time detection state
export interface PeopleDetectionState {
  isActive: boolean;
  isInitializing: boolean;
  model: DetectionModel | null;
  currentCount: number;
  detectedPersons: DetectedPerson[];
  lastDetection: Date | null;
  error: string | null;
  config: PeopleDetectionConfig;
  stats: PeopleDetectionStats;
}

// Events for real-time updates
export interface PeopleDetectionEventData {
  type: 'detection_result' | 'count_changed' | 'person_entered' | 'person_exited' | 'error';
  cameraId: string;
  roomId: string;
  data: any;
  timestamp: Date;
}

export type PeopleDetectionEventHandler = (event: PeopleDetectionEventData) => void;
