// components/AlertTester.tsx
import Button from '@/components/Button';
import Card from '@/components/Card';
import Typography from '@/components/Typography';
import { ALERT_THRESHOLDS, AlertService } from '@/modules/alerts/services/AlertService';
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

interface AlertTesterProps {
  onAlertTriggered?: (alertType: string) => void;
}

export const AlertTester: React.FC<AlertTesterProps> = ({ onAlertTriggered }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastTriggered, setLastTriggered] = useState<string | null>(null);
  const triggerTemperatureAlert = async () => {
    setIsLoading(true);
    try {
      // Directly generate alert instead of using checkForAlerts
      await AlertService.generateAlert({
        roomId: 'test-room-ui-temp',
        roomName: 'UI Test Room - Temperature',
        sensorId: 'ui-temp-sensor-001',
        sensorType: 'tempHumidity',
        type: 'high_temperature',
        severity: 'high',
        message: `High temperature detected in UI Test Room - Temperature (Manual Test Temperature Sensor): 32°C.`,
        triggeringValue: '32°C',
      });      setLastTriggered('High Temperature Alert');
      onAlertTriggered?.('temperature');
      
      Alert.alert(
        '🔥 Temperature Alert Triggered!',
        `Temperature: 32°C (Threshold: ${ALERT_THRESHOLDS.TEMPERATURE_HIGH}°C)\nSeverity: HIGH`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error triggering temperature alert:', error);
      Alert.alert('Error', 'Failed to trigger temperature alert');
    } finally {
      setIsLoading(false);
    }
  };
  const triggerHumidityAlert = async () => {
    setIsLoading(true);
    try {
      // Directly generate alert instead of using checkForAlerts
      await AlertService.generateAlert({
        roomId: 'test-room-ui-humidity',
        roomName: 'UI Test Room - Humidity',
        sensorId: 'ui-humidity-sensor-001',
        sensorType: 'tempHumidity',
        type: 'high_humidity',
        severity: 'high',
        message: `High humidity detected in UI Test Room - Humidity (Manual Test Humidity Sensor): 75%.`,
        triggeringValue: '75%',
      });

      setLastTriggered('High Humidity Alert');
      onAlertTriggered?.('humidity');
      
      Alert.alert(
        '💧 Humidity Alert Triggered!',
        `Humidity: 75% (Threshold: ${ALERT_THRESHOLDS.HUMIDITY_HIGH}%)\nSeverity: HIGH`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error triggering humidity alert:', error);
      Alert.alert('Error', 'Failed to trigger humidity alert');
    } finally {
      setIsLoading(false);
    }
  };
  const triggerCriticalAlerts = async () => {
    setIsLoading(true);
    try {
      // Generate critical temperature alert
      await AlertService.generateAlert({
        roomId: 'test-room-ui-critical',
        roomName: 'UI Test Room - Critical',
        sensorId: 'ui-critical-sensor-001',
        sensorType: 'tempHumidity',
        type: 'high_temperature',
        severity: 'critical',
        message: `Critical high temperature detected in UI Test Room - Critical (Manual Test Critical Sensor): 37°C.`,
        triggeringValue: '37°C',
      });

      // Generate critical humidity alert
      await AlertService.generateAlert({
        roomId: 'test-room-ui-critical',
        roomName: 'UI Test Room - Critical',
        sensorId: 'ui-critical-sensor-001',
        sensorType: 'tempHumidity',
        type: 'high_humidity',
        severity: 'critical',
        message: `Critical high humidity detected in UI Test Room - Critical (Manual Test Critical Sensor): 85%.`,
        triggeringValue: '85%',
      });

      setLastTriggered('Critical Temperature & Humidity Alerts');
      onAlertTriggered?.('critical');
      
      Alert.alert(
        '🆘 Critical Alerts Triggered!',
        `Temperature: 37°C (Critical: ${ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_HIGH}°C)\nHumidity: 85% (Critical: ${ALERT_THRESHOLDS.HUMIDITY_CRITICAL_HIGH}%)\nSeverity: CRITICAL`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error triggering critical alerts:', error);
      Alert.alert('Error', 'Failed to trigger critical alerts');
    } finally {
      setIsLoading(false);
    }
  };
  const triggerLowTemperatureAlert = async () => {
    setIsLoading(true);
    try {
      // Directly generate alert instead of using checkForAlerts
      await AlertService.generateAlert({
        roomId: 'test-room-ui-low-temp',
        roomName: 'UI Test Room - Low Temperature',
        sensorId: 'ui-low-temp-sensor-001',
        sensorType: 'tempHumidity',
        type: 'low_temperature',
        severity: 'high',
        message: `Low temperature detected in UI Test Room - Low Temperature (Manual Test Low Temperature Sensor): 8°C.`,
        triggeringValue: '8°C',
      });

      setLastTriggered('Low Temperature Alert');
      onAlertTriggered?.('low_temperature');
      
      Alert.alert(
        '🧊 Low Temperature Alert Triggered!',
        `Temperature: 8°C (Threshold: ${ALERT_THRESHOLDS.TEMPERATURE_LOW}°C)\nSeverity: HIGH`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error triggering low temperature alert:', error);
      Alert.alert('Error', 'Failed to trigger low temperature alert');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card style={styles.container}>

      <View style={styles.buttonContainer}>        <Button
          title="🔥 Trigger High Temperature"
          onPress={triggerTemperatureAlert}
          disabled={isLoading}
          variant="outline"
          style={styles.button}
        />
        
        <Button
          title="💧 Trigger High Humidity"
          onPress={triggerHumidityAlert}
          disabled={isLoading}
          variant="outline"
          style={styles.button}
        />
        
        <Button
          title="🧊 Trigger Low Temperature"
          onPress={triggerLowTemperatureAlert}
          disabled={isLoading}
          variant="outline"
          style={styles.button}
        />
        
        <Button
          title="🆘 Trigger Critical Alerts"
          onPress={triggerCriticalAlerts}
          disabled={isLoading}
          variant="danger"
          style={styles.button}
        />
      </View>

      {lastTriggered && (
        <View style={styles.lastTriggered}>
          <Typography variant="caption" style={styles.lastTriggeredText}>
            Last triggered: {lastTriggered}
          </Typography>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: 16,
    padding: 16,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.7,
  },
  thresholds: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  thresholdTitle: {
    fontWeight: '600',
    marginBottom: 4,
  },
  buttonContainer: {
    gap: 12,
  },
  button: {
    marginBottom: 0,
  },
  lastTriggered: {
    marginTop: 16,
    padding: 8,
    backgroundColor: '#e8f5e8',
    borderRadius: 4,
  },
  lastTriggeredText: {
    textAlign: 'center',
    color: '#2d5a2d',
  },
});
