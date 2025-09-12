// scripts/alertSimulator.ts
/**
 * Alert Simulator for Temperature and Humidity
 * This script simulates various temperature and humidity conditions to trigger alerts
 */

import { ALERT_THRESHOLDS, AlertService } from '@/modules/alerts/services/AlertService';
import { TempHumidityData } from '@/types/sensor';

interface SimulationScenario {
  name: string;
  description: string;
  temperature: number;
  humidity: number;
  expectedTempAlert?: {
    type: 'high_temperature' | 'low_temperature';
    severity: 'critical' | 'high' | 'medium';
  };
  expectedHumAlert?: {
    type: 'high_humidity' | 'low_humidity';
    severity: 'critical' | 'high' | 'medium';
  };
}

export class AlertSimulator {
  private static readonly TEST_ROOM_ID = 'sim-room-001';
  private static readonly TEST_ROOM_NAME = 'Simulation Lab';
  private static readonly TEST_SENSOR_ID = 'sim-sensor-temp-hum-001';

  // Simulation scenarios for testing different alert conditions
  private static readonly SCENARIOS: SimulationScenario[] = [
    {
      name: 'Normal Conditions',
      description: 'Normal temperature and humidity - no alerts expected',
      temperature: 25,
      humidity: 50,
    },
    {
      name: 'High Temperature Alert',
      description: 'Temperature above high threshold',
      temperature: 32,
      humidity: 50,
      expectedTempAlert: { type: 'high_temperature', severity: 'high' },
    },
    {
      name: 'Critical High Temperature',
      description: 'Temperature above critical threshold',
      temperature: 37,
      humidity: 50,
      expectedTempAlert: { type: 'high_temperature', severity: 'critical' },
    },
    {
      name: 'Low Temperature Alert',
      description: 'Temperature below low threshold',
      temperature: 8,
      humidity: 50,
      expectedTempAlert: { type: 'low_temperature', severity: 'high' },
    },
    {
      name: 'Critical Low Temperature',
      description: 'Temperature below critical low threshold',
      temperature: 3,
      humidity: 50,
      expectedTempAlert: { type: 'low_temperature', severity: 'critical' },
    },
    {
      name: 'High Humidity Alert',
      description: 'Humidity above high threshold',
      temperature: 25,
      humidity: 75,
      expectedHumAlert: { type: 'high_humidity', severity: 'high' },
    },
    {
      name: 'Critical High Humidity',
      description: 'Humidity above critical threshold',
      temperature: 25,
      humidity: 85,
      expectedHumAlert: { type: 'high_humidity', severity: 'critical' },
    },
    {
      name: 'Low Humidity Alert',
      description: 'Humidity below low threshold',
      temperature: 25,
      humidity: 15,
      expectedHumAlert: { type: 'low_humidity', severity: 'medium' },
    },
    {
      name: 'Extreme Conditions',
      description: 'Both temperature and humidity in critical ranges',
      temperature: 38,
      humidity: 90,
      expectedTempAlert: { type: 'high_temperature', severity: 'critical' },
      expectedHumAlert: { type: 'high_humidity', severity: 'critical' },
    },
    {
      name: 'Cold and Dry',
      description: 'Both temperature and humidity below thresholds',
      temperature: 2,
      humidity: 10,
      expectedTempAlert: { type: 'low_temperature', severity: 'critical' },
      expectedHumAlert: { type: 'low_humidity', severity: 'medium' },
    },
  ];

  /**
   * Run a single simulation scenario
   */
  static async runScenario(scenario: SimulationScenario): Promise<void> {
    console.log(`\n🧪 Running Scenario: ${scenario.name}`);
    console.log(`📋 Description: ${scenario.description}`);
    console.log(`🌡️  Temperature: ${scenario.temperature}°C`);
    console.log(`💧 Humidity: ${scenario.humidity}%`);

    const sensorData: TempHumidityData = {
        name: 'Simulation Temp/Humidity Sensor',
        temperature: scenario.temperature,
        humidity: scenario.humidity,
        timestamp: new Date(),
        id: '',
        status: 'critical'
    };

    try {
      await AlertService.checkForAlerts(
        this.TEST_ROOM_ID,
        this.TEST_ROOM_NAME,
        this.TEST_SENSOR_ID,
        'tempHumidity',
        sensorData
      );

      console.log('✅ Scenario completed successfully');
      
      // Log expected vs actual alerts
      if (scenario.expectedTempAlert) {
        console.log(`🔔 Expected Temperature Alert: ${scenario.expectedTempAlert.type} (${scenario.expectedTempAlert.severity})`);
      }
      if (scenario.expectedHumAlert) {
        console.log(`🔔 Expected Humidity Alert: ${scenario.expectedHumAlert.type} (${scenario.expectedHumAlert.severity})`);
      }
      if (!scenario.expectedTempAlert && !scenario.expectedHumAlert) {
        console.log('🔕 No alerts expected for this scenario');
      }

    } catch (error) {
      console.error(`❌ Error in scenario ${scenario.name}:`, error);
    }
  }

  /**
   * Run all simulation scenarios
   */
  static async runAllScenarios(): Promise<void> {
    console.log('🚀 Starting Alert Simulation for Temperature and Humidity');
    console.log('='.repeat(60));
    
    console.log('\n📊 Current Alert Thresholds:');
    console.log(`Temperature - Critical High: ${ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_HIGH}°C`);
    console.log(`Temperature - High: ${ALERT_THRESHOLDS.TEMPERATURE_HIGH}°C`);
    console.log(`Temperature - Low: ${ALERT_THRESHOLDS.TEMPERATURE_LOW}°C`);
    console.log(`Temperature - Critical Low: ${ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_LOW}°C`);
    console.log(`Humidity - Critical High: ${ALERT_THRESHOLDS.HUMIDITY_CRITICAL_HIGH}%`);
    console.log(`Humidity - High: ${ALERT_THRESHOLDS.HUMIDITY_HIGH}%`);
    console.log(`Humidity - Low: ${ALERT_THRESHOLDS.HUMIDITY_LOW}%`);

    for (let i = 0; i < this.SCENARIOS.length; i++) {
      const scenario = this.SCENARIOS[i];
      console.log(`\n[${i + 1}/${this.SCENARIOS.length}] Running scenario...`);
      await this.runScenario(scenario);
      
      // Add delay between scenarios to avoid rapid-fire alerts
      if (i < this.SCENARIOS.length - 1) {
        console.log('⏳ Waiting 2 seconds before next scenario...');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n🎉 All simulation scenarios completed!');
    console.log('='.repeat(60));
  }

  /**
   * Run specific scenarios by name
   */
  static async runSpecificScenarios(scenarioNames: string[]): Promise<void> {
    console.log(`🎯 Running specific scenarios: ${scenarioNames.join(', ')}`);
    
    for (const name of scenarioNames) {
      const scenario = this.SCENARIOS.find(s => s.name === name);
      if (scenario) {
        await this.runScenario(scenario);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.error(`❌ Scenario "${name}" not found`);
      }
    }
  }

  /**
   * Create custom sensor data for testing
   */
  static async testCustomValues(temperature: number, humidity: number): Promise<void> {
    console.log(`\n🔧 Testing Custom Values - Temp: ${temperature}°C, Humidity: ${humidity}%`);
    
    const customScenario: SimulationScenario = {
      name: 'Custom Test',
      description: `Custom temperature: ${temperature}°C, humidity: ${humidity}%`,
      temperature,
      humidity,
    };

    await this.runScenario(customScenario);
  }

  /**
   * Get list of available scenarios
   */
  static getAvailableScenarios(): string[] {
    return this.SCENARIOS.map(s => s.name);
  }

  /**
   * Display threshold information
   */
  static displayThresholds(): void {
    console.log('\n📋 Alert Thresholds Reference:');
    console.log('Temperature Alerts:');
    console.log(`  🔥 Critical High: ≥ ${ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_HIGH}°C`);
    console.log(`  🌡️  High: ≥ ${ALERT_THRESHOLDS.TEMPERATURE_HIGH}°C`);
    console.log(`  🧊 Low: ≤ ${ALERT_THRESHOLDS.TEMPERATURE_LOW}°C`);
    console.log(`  ❄️  Critical Low: ≤ ${ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_LOW}°C`);
    
    console.log('\nHumidity Alerts:');
    console.log(`  💧 Critical High: ≥ ${ALERT_THRESHOLDS.HUMIDITY_CRITICAL_HIGH}%`);
    console.log(`  🌊 High: ≥ ${ALERT_THRESHOLDS.HUMIDITY_HIGH}%`);
    console.log(`  🏜️  Low: ≤ ${ALERT_THRESHOLDS.HUMIDITY_LOW}%`);
  }
}

// Example usage functions for manual testing
export const simulateHighTemperature = () => AlertSimulator.testCustomValues(36, 50);
export const simulateLowTemperature = () => AlertSimulator.testCustomValues(4, 50);
export const simulateHighHumidity = () => AlertSimulator.testCustomValues(25, 85);
export const simulateLowHumidity = () => AlertSimulator.testCustomValues(25, 15);
export const simulateExtremeConditions = () => AlertSimulator.testCustomValues(38, 90);
export const simulateNormalConditions = () => AlertSimulator.testCustomValues(25, 50);

// If running directly
if (require.main === module) {
  AlertSimulator.runAllScenarios().catch(console.error);
}
