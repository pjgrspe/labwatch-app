// __tests__/alertIntegration.test.ts
/**
 * Integration tests for Alert System focusing on Temperature and Humidity alerts
 * These tests simulate real-world scenarios and validate the complete alert flow
 */

import { AlertService } from '@/modules/alerts/services/AlertService';
import { TempHumidityData } from '@/types/sensor';
import { beforeEach, describe, expect, jest, test } from '@jest/globals';

// Mock Firebase and dependencies
jest.mock('firebase/firestore');
jest.mock('@/FirebaseConfig', () => ({ db: {} }));
jest.mock('@/modules/auth/services/AuthService');
jest.mock('@/modules/rooms/services/RoomService');

describe('Alert Integration Tests - Temperature & Humidity', () => {
  let mockAddDoc: jest.Mock;
  let mockGetDocs: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    
    const { addDoc, getDocs } = require('firebase/firestore');
    mockAddDoc = addDoc;
    mockGetDocs = getDocs;
    
    // Default: no existing alerts
    mockGetDocs.mockResolvedValue({ empty: true, docs: [] });
    mockAddDoc.mockResolvedValue({ id: 'mock-alert-id' });

    // Mock room service to return monitored room
    const { RoomService } = require('@/modules/rooms/services/RoomService');
    RoomService.getRoomById.mockResolvedValue({ isMonitored: true });
  });

  describe('Temperature Alert Integration', () => {
    test('Critical High Temperature Scenario', async () => {
      const testData: TempHumidityData = {
        name: 'Lab Temperature Sensor',
        temperature: 37.5, // Above critical threshold
        humidity: 45,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'lab-001',
        'Main Laboratory',
        'temp-sensor-001',
        'tempHumidity',
        testData
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          roomId: 'lab-001',
          roomName: 'Main Laboratory',
          sensorId: 'temp-sensor-001',
          sensorType: 'tempHumidity',
          type: 'high_temperature',
          severity: 'critical',
          message: 'Critical high temperature detected in Main Laboratory (Lab Temperature Sensor): 37.5°C.',
          triggeringValue: '37.5°C',
          acknowledged: false,
        })
      );
    });

    test('Low Temperature Warning Scenario', async () => {
      const testData: TempHumidityData = {
        name: 'Cold Storage Sensor',
        temperature: 8.2, // Below low threshold but above critical
        humidity: 60,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'storage-001',
        'Cold Storage Room',
        'temp-sensor-002',
        'tempHumidity',
        testData
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_temperature',
          severity: 'high',
          message: 'Low temperature detected in Cold Storage Room (Cold Storage Sensor): 8.2°C.',
          triggeringValue: '8.2°C',
        })
      );
    });

    test('Normal Temperature - No Alert', async () => {
      const testData: TempHumidityData = {
        name: 'Normal Room Sensor',
        temperature: 22.5, // Normal range
        humidity: 45,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'office-001',
        'Office Room',
        'temp-sensor-003',
        'tempHumidity',
        testData
      );

      // Should not generate temperature alerts
      expect(mockAddDoc).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: expect.stringMatching(/temperature/),
        })
      );
    });
  });

  describe('Humidity Alert Integration', () => {
    test('Critical High Humidity Scenario', async () => {
      const testData: TempHumidityData = {
        name: 'Humidity Monitor',
        temperature: 24,
        humidity: 87, // Above critical threshold
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'greenhouse-001',
        'Greenhouse Lab',
        'hum-sensor-001',
        'tempHumidity',
        testData
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_humidity',
          severity: 'critical',
          message: 'Critical high humidity detected in Greenhouse Lab (Humidity Monitor): 87%.',
          triggeringValue: '87%',
        })
      );
    });

    test('Low Humidity Warning Scenario', async () => {
      const testData: TempHumidityData = {
        name: 'Dry Room Sensor',
        temperature: 23,
        humidity: 18, // Below low threshold
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'cleanroom-001',
        'Clean Room',
        'hum-sensor-002',
        'tempHumidity',
        testData
      );

      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_humidity',
          severity: 'medium',
          message: 'Low humidity detected in Clean Room (Dry Room Sensor): 18%.',
          triggeringValue: '18%',
        })
      );
    });
  });

  describe('Combined Alert Scenarios', () => {
    test('Extreme Conditions - Both Temp and Humidity Critical', async () => {
      const testData: TempHumidityData = {
        name: 'Multi-Sensor Unit',
        temperature: 39, // Critical high
        humidity: 88,    // Critical high
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'server-room-001',
        'Server Room',
        'multi-sensor-001',
        'tempHumidity',
        testData
      );

      // Should generate both alerts
      expect(mockAddDoc).toHaveBeenCalledTimes(2);

      // Temperature alert
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_temperature',
          severity: 'critical',
          triggeringValue: '39°C',
        })
      );

      // Humidity alert
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_humidity',
          severity: 'critical',
          triggeringValue: '88%',
        })
      );
    });

    test('Mixed Severity Conditions', async () => {
      const testData: TempHumidityData = {
        name: 'Lab Environment Sensor',
        temperature: 32, // High (not critical)
        humidity: 15,    // Low
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'research-lab-001',
        'Research Lab',
        'env-sensor-001',
        'tempHumidity',
        testData
      );

      expect(mockAddDoc).toHaveBeenCalledTimes(2);

      // Temperature alert - high severity
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_temperature',
          severity: 'high',
        })
      );

      // Humidity alert - medium severity
      expect(mockAddDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_humidity',
          severity: 'medium',
        })
      );
    });
  });

  describe('Alert Deduplication', () => {
    test('Should not create duplicate alerts for same conditions', async () => {
      // Mock existing alert
      mockGetDocs.mockResolvedValue({
        empty: false,
        docs: [{
          data: () => ({
            type: 'high_temperature',
            severity: 'critical',
            sensorId: 'temp-sensor-duplicate',
            timestamp: { toDate: () => new Date(Date.now() - 10000) } // 10 seconds ago
          })
        }]
      });

      const testData: TempHumidityData = {
        name: 'Duplicate Test Sensor',
        temperature: 36, // Would normally trigger alert
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'test-room-001',
        'Test Room',
        'temp-sensor-duplicate',
        'tempHumidity',
        testData
      );

      // Should not create new alert due to recent duplicate
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe('Room Monitoring Status', () => {
    test('Should skip alerts for unmonitored room', async () => {
      // Mock unmonitored room
      const { RoomService } = require('@/modules/rooms/services/RoomService');
      RoomService.getRoomById.mockResolvedValue({ isMonitored: false });

      const testData: TempHumidityData = {
        name: 'Unmonitored Sensor',
        temperature: 40, // Would normally trigger critical alert
        humidity: 90,    // Would normally trigger critical alert
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'unmonitored-room',
        'Unmonitored Room',
        'unmonitored-sensor',
        'tempHumidity',
        testData
      );

      // Should not generate any alerts
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });

  describe('Data Validation', () => {
    test('Should handle missing sensor data gracefully', async () => {
      const invalidData = {
        // Missing name field
        temperature: 35,
        humidity: 75,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'test-room-002',
        'Test Room 2',
        'invalid-sensor',
        'tempHumidity',
        invalidData
      );

      // Should not generate alerts due to invalid data
      expect(mockAddDoc).not.toHaveBeenCalled();
    });

    test('Should handle empty room name gracefully', async () => {
      const testData: TempHumidityData = {
        name: 'Valid Sensor',
        temperature: 35,
        humidity: 75,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'test-room-003',
        '', // Empty room name
        'valid-sensor',
        'tempHumidity',
        testData
      );

      // Should not generate alerts due to invalid room name
      expect(mockAddDoc).not.toHaveBeenCalled();
    });
  });
});
