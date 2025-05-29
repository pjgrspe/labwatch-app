import { ThemedText } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { getGaugeRangeForSensor } from '@/modules/alerts/services/AlertService';
import { interpolateColor, polarToCartesian } from '@/utils/dialGauge';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface DialGaugeProps {
  value: number;
  label: string;
  unit?: string;
  min?: number;
  max?: number;
  coldColor?: string;
  hotColor?: string;
  dangerLevel?: number;
  size?: number;
  statusColor?: string;
  sensorType?: string;
  dataType?: 'temperature' | 'humidity' | 'pm25' | 'pm10' | 'avgTemp' | 'maxTemp' | 'rmsAcceleration';
  useAlertBasedRange?: boolean;
}

const DialGauge: React.FC<DialGaugeProps> = ({
  value,
  label,
  unit,
  min,
  max,
  coldColor = '#3B82F6', // Clean blue
  hotColor = '#EF4444',   // Clean red
  dangerLevel,
  size = 150,
  statusColor,
  sensorType,
  dataType,
  useAlertBasedRange = false,
}) => {
  const themeTextColor = useThemeColor({}, 'text');
  const trackBackgroundColor = useThemeColor({}, 'borderColor');
  const dangerMarkerColor = '#F59E0B';
  const criticalColor = '#DC2626';

  // Minimal animation refs
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Get alert-based range if enabled
  const alertRange = useAlertBasedRange && sensorType && dataType 
    ? getGaugeRangeForSensor(sensorType, dataType)
    : null;

  const finalMin = alertRange?.min ?? min ?? 0;
  const finalMax = alertRange?.max ?? max ?? 100;
  const finalDangerLevel = alertRange?.dangerLevel ?? dangerLevel;
  const finalUnit = alertRange?.unit ?? unit ?? '';

  // Clean gauge configuration
  const center = size / 2;
  const strokeWidth = size * 0.06; // Thinner stroke for minimal look
  const radius = (size - strokeWidth) / 2 - size * 0.08;
  
  // Arc configuration (240 degrees for clean sweep)
  const startAngle = 240;
  const totalAngle = 240;

  // Value calculations
  const clampedValue = Math.min(Math.max(value, finalMin), finalMax);
  const percentage = (finalMax - finalMin) > 0 ? (clampedValue - finalMin) / (finalMax - finalMin) : 0;
  
  // Danger zone calculations
  const dangerPercentage = finalDangerLevel !== undefined && (finalMax - finalMin) > 0
    ? (finalDangerLevel - finalMin) / (finalMax - finalMin)
    : -1;

  // Minimal status determination
  const getStatusInfo = () => {
    if (finalDangerLevel !== undefined && clampedValue >= finalDangerLevel) {
      const criticalThreshold = finalDangerLevel + (finalMax - finalDangerLevel) * 0.5;
      if (clampedValue >= criticalThreshold) {
        return { color: criticalColor, status: 'CRITICAL', pulse: true };
      }
      return { color: dangerMarkerColor, status: 'WARNING', pulse: false };
    }
    return { 
      color: statusColor || interpolateColor(coldColor, hotColor, percentage), 
      status: 'NORMAL', 
      pulse: false
    };
  };

  const statusInfo = getStatusInfo();

  // Subtle animations
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 80,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

  useEffect(() => {
    if (statusInfo.pulse) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.08,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [statusInfo.pulse, pulseAnim]);

  // Create arc path
  const createArcPath = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(center, center, radius, endAngle);
    const end = polarToCartesian(center, center, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Background track
  const trackPath = createArcPath(startAngle, startAngle + totalAngle, radius);
  
  // Progress arc
  const progressAngle = totalAngle * percentage;
  const progressPath = createArcPath(startAngle, startAngle + progressAngle, radius);

  // Danger zone arc
  const dangerPath = dangerPercentage >= 0 && dangerPercentage <= 1 
    ? createArcPath(startAngle + (totalAngle * dangerPercentage), startAngle + totalAngle, radius)
    : null;

  // Indicator position
  const indicatorAngle = startAngle + (totalAngle * percentage);
  const indicatorPos = polarToCartesian(center, center, radius, indicatorAngle);

  // Clean font sizes
  const valueFontSize = size * 0.2;
  const unitFontSize = size * 0.07;
  const labelFontSize = size * 0.08;

  const showDegreeSymbol = finalUnit === 'C' || finalUnit === '°C';

  return (
    <Animated.View style={[
      styles.container, 
      { 
        width: size + 20,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      {/* Minimal label */}
      <ThemedText style={[
        styles.label, 
        { 
          color: themeTextColor, 
          fontSize: labelFontSize,
        }
      ]}>
        {label}
      </ThemedText>
      
      <Animated.View style={[
        styles.gaugeContainer, 
        { 
          width: size, 
          height: size,
          transform: statusInfo.pulse ? [{ scale: pulseAnim }] : undefined
        }
      ]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Defs>
            {/* Clean gradient */}
            <LinearGradient id={`gradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={coldColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={hotColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Background track */}
          <Path
            d={trackPath}
            stroke={trackBackgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={0.15}
          />

          {/* Danger zone (subtle) */}
          {dangerPath && (
            <Path
              d={dangerPath}
              stroke={dangerMarkerColor}
              strokeWidth={strokeWidth * 0.5}
              fill="none"
              strokeLinecap="round"
              opacity={0.4}
            />
          )}

          {/* Progress arc */}
          <Path
            d={progressPath}
            stroke={
              statusInfo.status === 'CRITICAL' ? criticalColor :
              statusInfo.status === 'WARNING' ? dangerMarkerColor :
              `url(#gradient-${label})`
            }
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={0.9}
          />

          {/* Simple indicator dot */}
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={size * 0.025}
            fill={statusInfo.color}
            opacity={0.8}
          />
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <ThemedText style={[
            styles.valueText, 
            { 
              color: statusInfo.color, 
              fontSize: valueFontSize,
              fontWeight: '300'
            }
          ]}>
            {Math.round(value)}
            {showDegreeSymbol && (
              <ThemedText style={[styles.degreeSymbol, { 
                color: statusInfo.color, 
                fontSize: valueFontSize * 0.4 
              }]}>
                °
              </ThemedText>
            )}
          </ThemedText>
          
          {finalUnit && (
            <ThemedText style={[
              styles.unitText, 
              { 
                color: themeTextColor, 
                fontSize: unitFontSize,
                opacity: 0.6
              }
            ]}>
              {finalUnit}
            </ThemedText>
          )}
        </View>
      </Animated.View>

      {/* Minimal status indicator */}
      {statusInfo.status !== 'NORMAL' && (
        <View style={[
          styles.statusDot, 
          { backgroundColor: statusInfo.color }
        ]} />
      )}

      {/* Clean range display */}
      <View style={styles.rangeContainer}>
        <ThemedText style={[styles.rangeText, { color: themeTextColor }]}>
          {Math.round(finalMin)}
        </ThemedText>
        <ThemedText style={[styles.rangeText, { color: themeTextColor }]}>
          {Math.round(finalMax)}
        </ThemedText>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
  },
  label: {
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginBottom: Layout.spacing.sm,
    opacity: 0.8,
  },
  gaugeContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: 'Montserrat-Light',
    textAlign: 'center',
  },
  degreeSymbol: {
    fontFamily: 'Montserrat-Light',
    position: 'absolute',
    top: -8,
  },
  unitText: {
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: -4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: Layout.spacing.xs,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '75%',
    marginTop: Layout.spacing.xs,
  },
  rangeText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 10,
    opacity: 0.5,
  },
});

export default DialGauge;