// labwatch-app/components/ui/DialGauge.tsx
import { Text as ThemedText } from '@/components/Themed';
import Layout from '@/constants/Layout'; // Import Layout for font sizes
import { useThemeColor } from '@/hooks/useThemeColor';
import { interpolateColor, polarToCartesian } from '@/utils/dialGauge';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';

interface DialGaugeProps {
  value: number;
  label: string;
  unit: string;
  min?: number;
  max?: number;
  coldColor?: string; // Will remain as passed
  hotColor?: string;  // Will remain as passed
  dangerLevel?: number;
  size?: number; // New prop for custom size
  statusColor?: string; // To pass the status-based color from parent
}

const DialGauge: React.FC<DialGaugeProps> = ({
  value,
  label,
  unit,
  min = 0,
  max = 100,
  coldColor = '#3B82F6', // Default cold color
  hotColor = '#EF4444',  // Default hot color
  dangerLevel,
  size = 150, // Default size, can be overridden
  statusColor, // Use this for the main value text color if provided
}) => {
  const themeTextColor = useThemeColor({}, 'text');
  const innerCircleFillColor = useThemeColor({}, 'cardBackground'); // Use cardBackground for inner part
  const tickBackgroundColor = useThemeColor({}, 'borderColor');
  const indicatorKnobColor = useThemeColor({}, 'tint'); // Use tint for the knob
  const dangerMarkerColor = useThemeColor({}, 'warningText'); // Use warningText for danger marker

  // --- Gauge Configuration based on size ---
  const center = size / 2;
  const numTicks = 50; // Reduced for smaller sizes
  const tickLength = size * 0.07; // Scaled
  const tickWidth = size * 0.015; // Scaled
  const radius = size / 2 - tickLength - (size * 0.05);
  const radiusOuter = radius + tickLength / 2;
  const radiusInner = radius - tickLength / 2;
  const startAngle = 181;
  const endAngle = 179;
  const angleRange = (endAngle < startAngle)
      ? (endAngle + 360 - startAngle)
      : (endAngle - startAngle);

  // --- Value Calculation ---
  const clampedValue = Math.min(Math.max(value, min), max);
  const percentage = (max - min) > 0 ? (clampedValue - min) / (max - min) : 0;
  const valueAngle = startAngle + percentage * angleRange;

  // --- Danger Level Calculation ---
  const dangerPercentage = dangerLevel !== undefined && (max - min) > 0
    ? (dangerLevel - min) / (max - min)
    : -1;
  const dangerAngle = startAngle + dangerPercentage * angleRange;

  // --- Generate Ticks ---
  const ticks = Array.from({ length: numTicks }).map((_, i) => {
    const tickPercentage = i / (numTicks - 1);
    const angle = startAngle + tickPercentage * angleRange;
    const tickValue = min + tickPercentage * (max - min);

    const start = polarToCartesian(center, center, radiusInner, angle);
    const end = polarToCartesian(center, center, radiusOuter, angle);

    let color = tickBackgroundColor;
    if (tickValue <= clampedValue) {
      // Use passed coldColor and hotColor for interpolation
      color = interpolateColor(coldColor, hotColor, tickPercentage);
    }

    const isDangerTick = dangerLevel !== undefined &&
        Math.abs(tickValue - dangerLevel) < ((max - min) / numTicks);

    if (isDangerTick) {
        color = dangerMarkerColor;
    }
    return { ...start, x2: end.x, y2: end.y, stroke: color };
  });

  const knobPos = polarToCartesian(center, center, radiusOuter, valueAngle);
  const dangerPos = (dangerLevel !== undefined && dangerPercentage >= 0 && dangerPercentage <= 1)
    ? polarToCartesian(center, center, radiusOuter + (size * 0.03), dangerAngle)
    : null;

  // Dynamic font sizes
  const valueFontSize = size * 0.25;
  const unitFontSize = size * 0.09;
  const labelFontSize = size * 0.1;
  const degreeSymbolSize = valueFontSize * 0.5;

  return (
    <View style={[styles.container, { width: size }]}>
      <ThemedText style={[styles.label, { color: themeTextColor, fontSize: labelFontSize, marginBottom: size * 0.05 }]}>{label}</ThemedText>
      <View style={[styles.gaugeContainer, { width: size, height: size }]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle
            cx={center}
            cy={center}
            r={radiusInner - (size*0.02)}
            fill={innerCircleFillColor}
          />
          {ticks.map((tick, index) => (
            <Line
              key={index}
              x1={tick.x}
              y1={tick.y}
              x2={tick.x2}
              y2={tick.y2}
              stroke={tick.stroke}
              strokeWidth={tickWidth}
              strokeLinecap="round"
            />
          ))}
          {dangerPos && (
             <Circle
                cx={dangerPos.x}
                cy={dangerPos.y}
                r={size * 0.025}
                fill={dangerMarkerColor}
             />
          )}
          <Circle
            cx={knobPos.x}
            cy={knobPos.y}
            r={size * 0.04}
            fill={indicatorKnobColor}
            stroke={useThemeColor({}, 'background')}
            strokeWidth="2"
          />
        </Svg>
        <View style={styles.textContainer}>
            <ThemedText style={[styles.valueText, { color: statusColor || themeTextColor, fontSize: valueFontSize, lineHeight: valueFontSize * 1.1 }]}>
                {Math.round(value)}
                <ThemedText style={[styles.degreeSymbol, { color: statusColor || themeTextColor, fontSize: degreeSymbolSize, bottom: valueFontSize * 0.1, left: valueFontSize * 0.05  }]}>°</ThemedText>
            </ThemedText>
            <ThemedText style={[styles.unitText, { color: themeTextColor, fontSize: unitFontSize,  marginTop: -size*0.02 }]}>
                {unit}
            </ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 5, // Reduced padding
    marginVertical: 10,
  },
  label: {
    fontWeight: Layout.fontWeight.medium, // Use Layout constants
    textTransform: 'uppercase',
    letterSpacing: 0.5, // Reduced letter spacing
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontWeight: Layout.fontWeight.light, // Use Layout constants
    position: 'relative',
  },
  degreeSymbol: {
      fontWeight: Layout.fontWeight.light, // Use Layout constants
      position: 'absolute',
      // Positioning will be relative to the valueText size
  },
  unitText: {
    fontWeight: Layout.fontWeight.normal, // Use Layout constants
  },
});

export default DialGauge;