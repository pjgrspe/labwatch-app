// __tests__/AlertService.test.ts
import { ALERT_THRESHOLDS, AlertService } from '@/modules/alerts/services/AlertService';
import { TempHumidityData } from '@/types/sensor';

// Mock Firebase
jest.mock('firebase/firestore', () => ({
  collection: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  limit: jest.fn(),
  getDocs: jest.fn(),
  addDoc: jest.fn(),
  serverTimestamp: jest.fn(() => ({ toDate: () => new Date() })),
}));

jest.mock('@/FirebaseConfig', () => ({
  db: {},
}));

jest.mock('@/modules/auth/services/AuthService', () => ({
  AuthService: {
    getUserProfile: jest.fn().mockResolvedValue({ fullName: 'Test User' }),
  },
}));

jest.mock('@/modules/rooms/services/RoomService', () => ({
  RoomService: {
    getRoomById: jest.fn().mockResolvedValue({ isMonitored: true }),
  },
}));

describe('AlertService Temperature and Humidity Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Temperature Alert Generation', () => {
    test('should generate critical high temperature alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-123' });

      const mockTempData: TempHumidityData = {
        name: 'Test Temp Sensor',
        temperature: 37, // Above critical threshold (35°C)
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-temp-01',
        'tempHumidity',
        mockTempData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_temperature',
          severity: 'critical',
          message: expect.stringContaining('Critical high temperature detected in Test Room (Test Temp Sensor): 37°C'),
          triggeringValue: '37°C',
        })
      );
    });

    test('should generate high temperature alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-124' });

      const mockTempData: TempHumidityData = {
        name: 'Test Temp Sensor',
        temperature: 32, // Above high threshold (30°C) but below critical (35°C)
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-temp-01',
        'tempHumidity',
        mockTempData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_temperature',
          severity: 'high',
          message: expect.stringContaining('High temperature detected in Test Room (Test Temp Sensor): 32°C'),
          triggeringValue: '32°C',
        })
      );
    });

    test('should generate critical low temperature alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-125' });

      const mockTempData: TempHumidityData = {
        name: 'Test Temp Sensor',
        temperature: 3, // Below critical low threshold (5°C)
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-temp-01',
        'tempHumidity',
        mockTempData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_temperature',
          severity: 'critical',
          message: expect.stringContaining('Critical low temperature detected in Test Room (Test Temp Sensor): 3°C'),
          triggeringValue: '3°C',
        })
      );
    });

    test('should generate low temperature alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-126' });

      const mockTempData: TempHumidityData = {
        name: 'Test Temp Sensor',
        temperature: 8, // Below low threshold (10°C) but above critical (5°C)
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-temp-01',
        'tempHumidity',
        mockTempData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_temperature',
          severity: 'high',
          message: expect.stringContaining('Low temperature detected in Test Room (Test Temp Sensor): 8°C'),
          triggeringValue: '8°C',
        })
      );
    });

    test('should not generate temperature alert for normal values', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });

      const mockTempData: TempHumidityData = {
        name: 'Test Temp Sensor',
        temperature: 25, // Normal temperature
        humidity: 50,
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-temp-01',
        'tempHumidity',
        mockTempData
      );

      // Should not call addDoc for temperature alerts
      expect(addDoc).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: expect.stringMatching(/temperature/),
        })
      );
    });
  });

  describe('Humidity Alert Generation', () => {
    test('should generate critical high humidity alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-127' });

      const mockHumidityData: TempHumidityData = {
        name: 'Test Humidity Sensor',
        temperature: 25,
        humidity: 85, // Above critical threshold (80%)
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-hum-01',
        'tempHumidity',
        mockHumidityData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_humidity',
          severity: 'critical',
          message: expect.stringContaining('Critical high humidity detected in Test Room (Test Humidity Sensor): 85%'),
          triggeringValue: '85%',
        })
      );
    });

    test('should generate high humidity alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-128' });

      const mockHumidityData: TempHumidityData = {
        name: 'Test Humidity Sensor',
        temperature: 25,
        humidity: 75, // Above high threshold (70%) but below critical (80%)
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-hum-01',
        'tempHumidity',
        mockHumidityData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_humidity',
          severity: 'high',
          message: expect.stringContaining('High humidity detected in Test Room (Test Humidity Sensor): 75%'),
          triggeringValue: '75%',
        })
      );
    });

    test('should generate low humidity alert', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValue({ id: 'alert-129' });

      const mockHumidityData: TempHumidityData = {
        name: 'Test Humidity Sensor',
        temperature: 25,
        humidity: 15, // Below low threshold (20%)
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-hum-01',
        'tempHumidity',
        mockHumidityData
      );

      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'low_humidity',
          severity: 'medium',
          message: expect.stringContaining('Low humidity detected in Test Room (Test Humidity Sensor): 15%'),
          triggeringValue: '15%',
        })
      );
    });

    test('should not generate humidity alert for normal values', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });

      const mockHumidityData: TempHumidityData = {
        name: 'Test Humidity Sensor',
        temperature: 25,
        humidity: 50, // Normal humidity
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-hum-01',
        'tempHumidity',
        mockHumidityData
      );

      // Should not call addDoc for humidity alerts
      expect(addDoc).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: expect.stringMatching(/humidity/),
        })
      );
    });
  });

  describe('Combined Temperature and Humidity Alerts', () => {
    test('should generate both temperature and humidity alerts when both exceed thresholds', async () => {
      const { getDocs, addDoc } = require('firebase/firestore');
      getDocs.mockResolvedValue({ empty: true, docs: [] });
      addDoc.mockResolvedValueOnce({ id: 'alert-temp-130' })
             .mockResolvedValueOnce({ id: 'alert-hum-131' });

      const mockData: TempHumidityData = {
        name: 'Combined Sensor',
        temperature: 36, // Critical high temperature
        humidity: 85,    // Critical high humidity
        timestamp: new Date(),
      };

      await AlertService.checkForAlerts(
        'room-123',
        'Test Room',
        'sensor-combined-01',
        'tempHumidity',
        mockData
      );

      // Should generate temperature alert
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_temperature',
          severity: 'critical',
          triggeringValue: '36°C',
        })
      );

      // Should generate humidity alert
      expect(addDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          type: 'high_humidity',
          severity: 'critical',
          triggeringValue: '85%',
        })
      );

      expect(addDoc).toHaveBeenCalledTimes(2);
    });
  });

  describe('Alert Thresholds Verification', () => {
    test('should have correct temperature thresholds', () => {
      expect(ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_HIGH).toBe(35);
      expect(ALERT_THRESHOLDS.TEMPERATURE_HIGH).toBe(30);
      expect(ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_LOW).toBe(5);
      expect(ALERT_THRESHOLDS.TEMPERATURE_LOW).toBe(10);
    });

    test('should have correct humidity thresholds', () => {
      expect(ALERT_THRESHOLDS.HUMIDITY_CRITICAL_HIGH).toBe(80);
      expect(ALERT_THRESHOLDS.HUMIDITY_HIGH).toBe(70);
      expect(ALERT_THRESHOLDS.HUMIDITY_LOW).toBe(20);
    });
  });
});
function expect(addDoc: any) {
    throw new Error('Function not implemented.');
}

