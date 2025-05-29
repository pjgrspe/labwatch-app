// Create labwatch-app/types/alerts.ts
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export type AlertType =
  // Environment
  | 'high_temperature'
  | 'low_temperature'
  | 'high_humidity'
  | 'low_humidity'
  | 'poor_air_quality_pm25'
  | 'poor_air_quality_pm10'
  | 'thermal_anomaly'
  | 'high_vibration'
  // Equipment Specific (Examples)
  | 'equipment_offline'
  | 'equipment_malfunction'
  // General / System
  | 'connection_lost' // Example for a sensor
  | 'maintenance_due' // Example for a future feature
  | 'test_alert'; // For testing purposes

export interface Alert {
  id: string; // Firestore document ID
  roomId: string;
  roomName: string; // Already present, ensure it's used
  sensorId?: string; // Optional, if the alert is tied to a specific sensor
  sensorType?: string; // e.g., 'tempHumidity', 'airQuality'
  type: AlertType;
  severity: AlertSeverity;
  message: string; // Human-readable description of the alert
  triggeringValue?: string | number; // e.g., "35°C" or "PM2.5: 150 µg/m³"
  timestamp: Date;
  acknowledged: boolean;
  acknowledgedAt?: Date;
  acknowledgedBy?: string; // User ID of who acknowledged
  acknowledgedByName?: string; // ADDED: Full name of the user who acknowledged
  details?: string; // More detailed information or context
}

// Example of a more specific alert type for future use
export interface TemperatureAlert extends Alert {
  type: 'high_temperature' | 'low_temperature';
  temperature: number;
  threshold: number;
}