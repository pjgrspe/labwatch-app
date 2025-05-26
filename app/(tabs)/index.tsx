// app/(tabs)/index.tsx (formerly dashboard.tsx)
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { ColorName } from '@/constants/Colors'; // Import ColorName
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';

const sensorData = [
  { id: '1', name: 'Temperature Lab A', value: '22.5°C', status: 'normal' },
  { id: '2', name: 'Air Quality Lab A', value: 'Good', status: 'normal' },
  { id: '3', name: 'Freezer 1 Temp', value: '-18°C', status: 'warning' },
  { id: '4', name: 'Gas Levels Lab B', value: '0.1 ppm CO', status: 'normal' },
];

const equipmentStatus = [
  { id: 'eq1', name: 'Fume Hood 1', status: 'Operational', icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap, colorToken: 'successText' as ColorName },
  { id: 'eq2', name: 'Centrifuge Alpha', status: 'Maintenance Due', icon: 'warning' as keyof typeof Ionicons.glyphMap, colorToken: 'warningText' as ColorName },
  { id: 'eq3', name: 'Autoclave Beta', status: 'Offline', icon: 'close-circle' as keyof typeof Ionicons.glyphMap, colorToken: 'errorText' as ColorName },
];

const predictionData = {
  nextMaintenance: 'Centrifuge Alpha - 3 days',
  potentialHazard: 'Elevated VOCs possible in Lab C tomorrow AM',
};

export default function DashboardScreen() {
  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const sectionTitleColor = useThemeColor({ light: '#4A4A4A', dark: '#CCCCCC' }, 'text'); // Explicitly using text as fallback
  const sensorNameColor = useThemeColor({ light: '#555', dark: '#bbb' }, 'text');
  const sensorValueColor = useThemeColor({ light: '#333', dark: '#ddd' }, 'text');
  const warningTextColor = useThemeColor({}, 'warningText');
  const equipmentNameColor = useThemeColor({ light: '#555', dark: '#bbb' }, 'text');
  const predictionTextColor = useThemeColor({ light: '#333', dark: '#ddd' }, 'text');
  const chartPlaceholderBackgroundColor = useThemeColor({ light: '#e9ecef', dark: '#3A3A3C' }, 'cardBackground');
  const iconColorBlue = useThemeColor({}, 'infoText');
  const iconColorRed = useThemeColor({}, 'errorText');
  const cardBorderColor = useThemeColor({}, 'borderColor');

  const getEquipmentIconColor = (token: ColorName) => useThemeColor({}, token);


  return (
    <ScrollView style={[styles.scrollView, { backgroundColor: scrollViewBackgroundColor }]} contentContainerStyle={styles.container}>
      <Card>
        <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Sensor Overview</ThemedText>
        {sensorData.map((sensor) => (
          <ThemedView key={sensor.id} style={[styles.sensorItem, { borderBottomColor: cardBorderColor }]}>
            <ThemedText style={[styles.sensorName, { color: sensorNameColor }]}>{sensor.name}:</ThemedText>
            <ThemedText style={[styles.sensorValue, { color: sensor.status === 'warning' ? warningTextColor : sensorValueColor }]}>
              {sensor.value}
            </ThemedText>
          </ThemedView>
        ))}
      </Card>

      <Card>
        <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Equipment Status</ThemedText>
        {equipmentStatus.map((equip) => (
          <ThemedView key={equip.id} style={[styles.equipmentItem, { borderBottomColor: cardBorderColor }]}>
            <Ionicons name={equip.icon} size={24} color={getEquipmentIconColor(equip.colorToken)} style={styles.equipmentIcon} />
            <ThemedText style={[styles.equipmentName, { color: equipmentNameColor }]}>{equip.name}:</ThemedText>
            <ThemedText style={[styles.equipmentStatus, { color: getEquipmentIconColor(equip.colorToken) }]}>{equip.status}</ThemedText>
          </ThemedView>
        ))}
      </Card>

      <Card>
        <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Predictive Analytics</ThemedText>
        <ThemedView style={styles.predictionItem}>
          <Ionicons name="build-outline" size={20} color={iconColorBlue} style={styles.predictionIcon} />
          <ThemedText style={[styles.predictionText, { color: predictionTextColor }]}>Next Maintenance: {predictionData.nextMaintenance}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.predictionItem}>
          <Ionicons name="alert-circle-outline" size={20} color={iconColorRed} style={styles.predictionIcon} />
          <ThemedText style={[styles.predictionText, { color: predictionTextColor }]}>Potential Hazard: {predictionData.potentialHazard}</ThemedText>
        </ThemedView>
      </Card>

      <Card>
        <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor }]}>Visualizations (Placeholder)</ThemedText>
        <ThemedView style={[styles.chartPlaceholder, {backgroundColor: chartPlaceholderBackgroundColor}]}>
          <ThemedText>Chart for Temperature Trends</ThemedText>
        </ThemedView>
        <ThemedView style={[styles.chartPlaceholder, {backgroundColor: chartPlaceholderBackgroundColor}]}>
          <ThemedText>Chart for Gas Levels</ThemedText>
        </ThemedView>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    padding: 16,
  },
  // Card itself will handle its marginBottom if defined in its own styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  sensorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth, // Using hairlineWidth for subtle separators
    backgroundColor: 'transparent',
  },
  sensorName: {
    fontSize: 16,
  },
  sensorValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  equipmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  equipmentIcon: {
    marginRight: 10,
  },
  equipmentName: {
    fontSize: 16,
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
    backgroundColor: 'transparent',
  },
  predictionIcon: {
    marginRight: 8,
  },
  predictionText: {
    fontSize: 15,
    flexShrink: 1,
  },
  chartPlaceholder: {
    height: 150,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
});