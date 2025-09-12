// Example usage in your app - you can add this to any screen
// For example, in app/(tabs)/more/index.tsx or create a new test screen

import { Typography } from '@/components';
import { AlertTester } from '@/components/AlertTester';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

export default function AlertTestScreen() {
  const handleAlertTriggered = (alertType: string) => {
    console.log(`Alert triggered: ${alertType}`);
    // You can add additional logic here, like refreshing the alerts list
  };

  return (
    <ScrollView style={styles.container}>
      <Typography variant="h2" style={styles.header}>
        Alert System Testing
      </Typography>
      
      <AlertTester onAlertTriggered={handleAlertTriggered} />
      
      <Typography variant="body2" style={styles.instructions}>
        Use the buttons above to manually trigger different types of alerts.
        After triggering an alert, check the Alerts tab to see the generated alerts.
      </Typography>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    textAlign: 'center',
    margin: 20,
  },
  instructions: {
    margin: 16,
    padding: 16,
    backgroundColor: '#f0f8ff',
    borderRadius: 8,
    textAlign: 'center',
  },
});
