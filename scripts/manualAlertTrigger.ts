// scripts/manualAlertTrigger.ts
/**
 * Manual Alert Trigger Script
 * Simple script to manually trigger temperature and humidity alerts for testing
 */

import { AlertService } from '@/modules/alerts/services/AlertService';
import { TempHumidityData } from '@/types/sensor';

export class ManualAlertTrigger {
  /**
   * Trigger a high temperature alert
   */
  static async triggerHighTemperatureAlert(): Promise<void> {
    console.log('🔥 Triggering High Temperature Alert...');
    
    const highTempData: TempHumidityData = {
        name: 'Test Temperature Sensor',
        temperature: 32, // Above high threshold (30°C)
        humidity: 50, // Normal humidity
        timestamp: new Date(),
        id: '',
        status: 'critical'
    };

    try {
      await AlertService.checkForAlerts(
        'test-room-temp',
        'Test Laboratory - Temperature',
        'manual-temp-sensor-001',
        'tempHumidity',
        highTempData
      );
      
      console.log('✅ High temperature alert triggered successfully');
      console.log(`   Temperature: ${highTempData.temperature}°C (Threshold: 30°C)`);
      console.log(`   Expected Alert: HIGH TEMPERATURE - HIGH SEVERITY`);
    } catch (error) {
      console.error('❌ Error triggering high temperature alert:', error);
    }
  }

  /**
   * Trigger a high humidity alert
   */
  static async triggerHighHumidityAlert(): Promise<void> {
    console.log('💧 Triggering High Humidity Alert...');
    
    const highHumidityData: TempHumidityData = {
        name: 'Test Humidity Sensor',
        temperature: 25, // Normal temperature
        humidity: 75, // Above high threshold (70%)
        timestamp: new Date(),
        id: '',
        status: 'normal'
    };

    try {
      await AlertService.checkForAlerts(
        'test-room-humidity',
        'Test Laboratory - Humidity',
        'manual-humidity-sensor-001',
        'tempHumidity',
        highHumidityData
      );
      
      console.log('✅ High humidity alert triggered successfully');
      console.log(`   Humidity: ${highHumidityData.humidity}% (Threshold: 70%)`);
      console.log(`   Expected Alert: HIGH HUMIDITY - HIGH SEVERITY`);
    } catch (error) {
      console.error('❌ Error triggering high humidity alert:', error);
    }
  }

  /**
   * Trigger both alerts simultaneously
   */
  static async triggerBothAlerts(): Promise<void> {
    console.log('🚨 Triggering Both Temperature and Humidity Alerts...');
    console.log('='.repeat(50));
    
    await this.triggerHighTemperatureAlert();
    console.log(''); // Empty line for spacing
    await this.triggerHighHumidityAlert();
    
    console.log('='.repeat(50));
    console.log('🎉 Both alerts have been triggered!');
  }

  /**
   * Trigger critical alerts for more severe testing
   */
  static async triggerCriticalAlerts(): Promise<void> {
    console.log('🆘 Triggering CRITICAL Temperature and Humidity Alerts...');
    
    const criticalData: TempHumidityData = {
        name: 'Critical Condition Sensor',
        temperature: 37, // Critical high temperature
        humidity: 85, // Critical high humidity
        timestamp: new Date(),
        id: '',
        status: 'critical'
    };

    try {
      await AlertService.checkForAlerts(
        'test-room-critical',
        'Test Laboratory - Critical Conditions',
        'manual-critical-sensor-001',
        'tempHumidity',
        criticalData
      );
      
      console.log('✅ Critical alerts triggered successfully');
      console.log(`   Temperature: ${criticalData.temperature}°C (Critical Threshold: 35°C)`);
      console.log(`   Humidity: ${criticalData.humidity}% (Critical Threshold: 80%)`);
      console.log(`   Expected Alerts: CRITICAL HIGH TEMPERATURE + CRITICAL HIGH HUMIDITY`);
    } catch (error) {
      console.error('❌ Error triggering critical alerts:', error);
    }
  }

  /**
   * Run demonstration of different alert levels
   */
  static async runDemo(): Promise<void> {
    console.log('🎭 Running Alert Demonstration...');
    console.log('This will trigger various temperature and humidity alerts');
    console.log('');

    // 1. Normal conditions (no alerts)
    console.log('1️⃣ Testing Normal Conditions (No Alerts Expected)');
    const normalData: TempHumidityData = {
        name: 'Normal Sensor',
        temperature: 25,
        humidity: 50,
        timestamp: new Date(),
        id: '',
        status: 'normal'
    };
    
    await AlertService.checkForAlerts(
      'demo-room-normal',
      'Demo Room - Normal',
      'demo-sensor-normal',
      'tempHumidity',
      normalData
    );
    console.log('   ✅ Normal conditions tested - no alerts expected');
    console.log('');

    // Wait between tests
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 2. High temperature
    console.log('2️⃣ Testing High Temperature Alert');
    await this.triggerHighTemperatureAlert();
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 3. High humidity
    console.log('3️⃣ Testing High Humidity Alert');
    await this.triggerHighHumidityAlert();
    console.log('');

    await new Promise(resolve => setTimeout(resolve, 1000));

    // 4. Critical conditions
    console.log('4️⃣ Testing Critical Conditions');
    await this.triggerCriticalAlerts();
    
    console.log('');
    console.log('🎉 Demo completed! Check your alerts dashboard to see the generated alerts.');
  }
}

// Export convenience functions
export const triggerTempAlert = () => ManualAlertTrigger.triggerHighTemperatureAlert();
export const triggerHumidityAlert = () => ManualAlertTrigger.triggerHighHumidityAlert();
export const triggerBothAlerts = () => ManualAlertTrigger.triggerBothAlerts();
export const runAlertDemo = () => ManualAlertTrigger.runDemo();

// If running directly from command line
if (require.main === module) {
  console.log('🔧 Manual Alert Trigger Script');
  console.log('Available commands:');
  console.log('- npm run trigger:temp - Trigger high temperature alert');
  console.log('- npm run trigger:humidity - Trigger high humidity alert');
  console.log('- npm run trigger:both - Trigger both alerts');
  console.log('- npm run trigger:demo - Run full demonstration');
  
  // Default: trigger both alerts
  ManualAlertTrigger.triggerBothAlerts().catch(console.error);
}
