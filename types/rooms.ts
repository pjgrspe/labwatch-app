// labwatch-app/types/room.ts
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from './sensor';

export interface RoomSensorData {
  tempHumidity?: TempHumidityData;
  airQuality?: AirQualityData;
  thermalImager?: ThermalImagerData;
  vibration?: VibrationData;
  // Add other sensor types as needed
}

export interface Room {
  [x: string]: any;
  id: string; // Firestore document ID
  name: string;
  location: string;
  isMonitored: boolean;
  createdAt: Date;
  isArchived?: boolean; // ADDED: To mark room as archived
  archivedAt?: Date; // ADDED: Timestamp for when the room was archived
  esp32ModuleId?: string; // ADDED: ESP32 module ID
  esp32ModuleName?: string; // ADDED: ESP32 module name
  // You might want to add createdBy (userId) if needed
}

// This will be the structure within a "sensors" subcollection for each room
export interface RoomSensorEntry extends RoomSensorData {
  timestamp: Date; // Timestamp for this specific sensor reading snapshot
}