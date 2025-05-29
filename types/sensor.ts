// labwatch-app/types/sensor.ts

// For SHT20 - Temperature and Humidity
export interface TempHumidityData {
  id: string;
  name: string;
  temperature: number; // Celsius
  humidity: number;    // Percentage
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

// For AMG8833 - Thermal Imager
export interface ThermalImagerData {
  id: string;
  name: string;
  /** 8x8 grid of temperature values, stored as a map of rows */
  pixels: Record<string, number[]>; // Changed from number[][]
  /** 8x8 grid of temperature values, stored as a map of rows */
  temperatures: Record<string, number[]>; // Changed from number[][]
  minTemp: number;
  maxTemp: number;
  avgTemp: number;
  timestamp: Date;
}

// For SDS011 - Air Quality
export type AQILevel = 'good' | 'moderate' | 'unhealthy_sensitive' | 'unhealthy' | 'very_unhealthy' | 'hazardous';

export interface AirQualityData {
  id: string;
  name: string;
  pm25: number;  // µg/m³
  pm10: number;  // µg/m³
  aqi?: number; // Calculated AQI
  aqiLevel?: AQILevel;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

// For MPU6050 - Vibration Sensor
export interface VibrationData {
  id: string;
  name: string;
  rmsAcceleration: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: Date;
}

// General Sensor Data type
export interface SensorDataItem {
  id: string;
  name: string;
  value: string;
  unit?: string;
  status: 'normal' | 'warning' | 'critical' | 'info';
  icon?: any;
  colorToken?: any;
  type: 'temperature' | 'humidity' | 'air_quality_pm25' | 'air_quality_pm10' | 'vibration' | 'thermal_avg' | 'generic';
}