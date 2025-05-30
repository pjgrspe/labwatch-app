// labwatch-app/components/ui/HeatmapGrid.tsx
// labwatch-app/components/ui/HeatmapGrid.tsx
import { Text as ThemedText } from '../Themed';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import React from 'react';
import { StyleSheet, View } from 'react-native';

// Define the props for HeatmapGrid
interface HeatmapGridProps {
  data: Record<string, number[]>; // Changed from number[][]
  minTempThreshold?: number; // Optional: Minimum temperature for 'cold' color
  maxTempThreshold?: number; // Optional: Maximum temperature for 'hot' color
  defaultColor?: string; // Optional: Fallback color
  coldColor?: string;
  neutralColor?: string;
  hotColor?: string;
  cellSize?: number; // Optional: to control the size of each cell
}

const HeatmapGrid: React.FC<HeatmapGridProps> = ({
  data,
  minTempThreshold = 20, // Default to 20°C
  maxTempThreshold = 30, // Default to 30°C
  defaultColor = '#CCCCCC', // Default gray for values outside thresholds or if no specific colors given
  coldColor = '#007AFF',    // Example: Blue for cold
  neutralColor = '#A9A9A9', // Example: Dark Gray for neutral
  hotColor = '#FF3B30',     // Example: Red for hot
  cellSize = Layout.window.width / 12, // Dynamic cell size based on screen width (adjust divisor as needed)
}) => {
  const themeCellBorderColor = useThemeColor({}, 'borderColor');

  // Convert Record<string, number[]> to number[][]
  // Sort by keys numerically to ensure correct row order if keys are "0", "1", "2", etc.
  const gridDataArray: number[][] = React.useMemo(() => {
    if (!data || typeof data !== 'object') return [];
    return Object.entries(data)
      .sort(([keyA], [keyB]) => Number(keyA) - Number(keyB))
      .map(([, rowArray]) => rowArray);
  }, [data]);

  const getColorForTemperature = (temp: number): string => {
    if (temp < minTempThreshold) {
      return coldColor;
    } else if (temp > maxTempThreshold) {
      return hotColor;
    } else if (minTempThreshold <= temp && temp <= maxTempThreshold) {
      const midPoint = (minTempThreshold + maxTempThreshold) / 2;
      const range = maxTempThreshold - minTempThreshold;
      if (range === 0) return neutralColor;

      if (temp < midPoint - range * 0.15) return coldColor;
      if (temp > midPoint + range * 0.15) return hotColor;
      return neutralColor;
    }
    return defaultColor;
  };

  if (!gridDataArray || gridDataArray.length === 0 || gridDataArray.some(row => !Array.isArray(row))) {
    return (
      <View style={styles.container}>
        <ThemedText>No valid heatmap data provided or data is empty.</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.gridContainer, { width: cellSize * (gridDataArray[0]?.length || 0) }]}>
      {gridDataArray.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.row}>
          {row.map((temp, cellIndex) => (
            <View
              key={`cell-${rowIndex}-${cellIndex}`}
              style={[
                styles.cell,
                {
                  backgroundColor: getColorForTemperature(temp),
                  width: cellSize,
                  height: cellSize,
                  borderColor: themeCellBorderColor,
                },
              ]}
            >
              {/* Optional: Display temperature value in each cell */}
              {/* <ThemedText style={styles.cellText}>{temp.toFixed(1)}</ThemedText> */}
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Layout.spacing.md,
    alignItems: 'center',
  },
  gridContainer: {
    flexDirection: 'column',
    borderWidth: 1,
    borderColor: '#CCC', 
    alignSelf: 'center', 
    marginVertical: Layout.spacing.sm,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5, 
  },
  cellText: { 
    fontSize: Layout.fontSize.xs / 1.5, 
    color: '#FFFFFF', 
  },
});

export default HeatmapGrid;