// app/(tabs)/index.tsx (formerly dashboard.tsx)
import Card from '@/components/Card'; // Assuming alias @ is set up for root
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, View } from 'react-native';

// Dummy Data
const sensorData = [
  { id: '1', name: 'Temperature Lab A', value: '22.5°C', status: 'normal' },
  { id: '2', name: 'Air Quality Lab A', value: 'Good', status: 'normal' },
  { id: '3', name: 'Freezer 1 Temp', value: '-18°C', status: 'warning' },
  { id: '4', name: 'Gas Levels Lab B', value: '0.1 ppm CO', status: 'normal' },
];

const equipmentStatus = [
  { id: 'eq1', name: 'Fume Hood 1', status: 'Operational', icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, color: 'green' },
  { id: 'eq2', name: 'Centrifuge Alpha', status: 'Maintenance Due', icon: 'warning' as keyof typeof Ionicons.glyphMap, color: 'orange' },
  { id: 'eq3', name: 'Autoclave Beta', status: 'Offline', icon: 'close-circle' as keyof typeof Ionicons.glyphMap, color: 'red' },
];

const predictionData = {
  nextMaintenance: 'Centrifuge Alpha - 3 days',
  potentialHazard: 'Elevated VOCs possible in Lab C tomorrow AM',
};

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  return (
    <ScrollView style={styles.scrollView} contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>LabWatch Dashboard</Text>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Sensor Overview</Text>
        {sensorData.map((sensor) => (
          <View key={sensor.id} style={styles.sensorItem}>
            <Text style={styles.sensorName}>{sensor.name}:</Text>
            <Text style={[styles.sensorValue, sensor.status === 'warning' && styles.warningText]}>
              {sensor.value}
            </Text>
          </View>
        ))}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Equipment Status</Text>
        {equipmentStatus.map((equip) => (
          <View key={equip.id} style={styles.equipmentItem}>
            <Ionicons name={equip.icon} size={24} color={equip.color} style={styles.equipmentIcon} />
            <Text style={styles.equipmentName}>{equip.name}:</Text>
            <Text style={[styles.equipmentStatus, { color: equip.color }]}>{equip.status}</Text>
          </View>
        ))}
      </Card>

      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Predictive Analytics</Text>
        <View style={styles.predictionItem}>
          <Ionicons name="build-outline" size={20} color="#4A90E2" style={styles.predictionIcon} />
          <Text style={styles.predictionText}>Next Maintenance: {predictionData.nextMaintenance}</Text>
        </View>
        <View style={styles.predictionItem}>
          <Ionicons name="alert-circle-outline" size={20} color="#D0021B" style={styles.predictionIcon} />
          <Text style={styles.predictionText}>Potential Hazard: {predictionData.potentialHazard}</Text>
        </View>
      </Card>

      {/* Placeholder for charts - you'd integrate a charting library here */}
      <Card style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Visualizations (Placeholder)</Text>
        <View style={styles.chartPlaceholder}>
          <Text>Chart for Temperature Trends</Text>
        </View>
        <View style={styles.chartPlaceholder}>
          <Text>Chart for Gas Levels</Text>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    padding: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
    color: '#4A4A4A',
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sensorName: {
    fontSize: 16,
    color: '#555',
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  warningText: {
    color: 'orange',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  equipmentIcon: {
    marginRight: 10,
  },
  equipmentName: {
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  equipmentStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  predictionIcon: {
    marginRight: 8,
  },
  predictionText: {
    fontSize: 15,
    color: '#333',
    flexShrink: 1, // Allow text to wrap
  },
  chartPlaceholder: {
    height: 150,
    backgroundColor: '#e9ecef',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});