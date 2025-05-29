import { Text as ThemedText } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
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
  coldColor = '#06B6D4', // Modern cyan
  hotColor = '#EF4444',
  dangerLevel,
  size = 150,
  statusColor,
  sensorType,
  dataType,
  useAlertBasedRange = false,
}) => {
  const themeTextColor = useThemeColor({}, 'text');
  const innerCircleFillColor = useThemeColor({}, 'cardBackground');
  const trackBackgroundColor = useThemeColor({}, 'borderColor');
  const indicatorKnobColor = useThemeColor({}, 'tint');
  const dangerMarkerColor = '#F59E0B'; // Amber warning color
  const criticalColor = '#DC2626'; // Red critical color
  const successColor = '#10B981'; // Green success color

  // Animation refs
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;

  // Get alert-based range if enabled
  const alertRange = useAlertBasedRange && sensorType && dataType 
    ? getGaugeRangeForSensor(sensorType, dataType)
    : null;

  const finalMin = alertRange?.min ?? min ?? 0;
  const finalMax = alertRange?.max ?? max ?? 100;
  const finalDangerLevel = alertRange?.dangerLevel ?? dangerLevel;
  const finalUnit = alertRange?.unit ?? unit ?? '';

  // Modern gauge configuration
  const center = size / 2;
  const strokeWidth = size * 0.08; // Slightly thinner for cleaner look
  const radius = (size - strokeWidth) / 2 - size * 0.08;
  
  // Arc configuration (270 degrees)
  const startAngle = 225; // Start from bottom-left
  const totalAngle = 270;

  // Value calculations
  const clampedValue = Math.min(Math.max(value, finalMin), finalMax);
  const percentage = (finalMax - finalMin) > 0 ? (clampedValue - finalMin) / (finalMax - finalMin) : 0;
  
  // Danger zone calculations
  const dangerPercentage = finalDangerLevel !== undefined && (finalMax - finalMin) > 0
    ? (finalDangerLevel - finalMin) / (finalMax - finalMin)
    : -1;

  // Determine status based on value
  const getStatusInfo = () => {
    if (finalDangerLevel !== undefined && clampedValue >= finalDangerLevel) {
      const criticalThreshold = finalDangerLevel + (finalMax - finalDangerLevel) * 0.5;
      if (clampedValue >= criticalThreshold) {
        return { color: criticalColor, status: 'CRITICAL', pulse: true, icon: '⚠️' };
      }
      return { color: dangerMarkerColor, status: 'WARNING', pulse: false, icon: '⚡' };
    }
    return { 
      color: statusColor || interpolateColor(coldColor, hotColor, percentage), 
      status: 'NORMAL', 
      pulse: false,
      icon: '✓'
    };
  };

  const statusInfo = getStatusInfo();

  // Start pulse animation for critical alerts
  useEffect(() => {
    if (statusInfo.pulse) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [statusInfo.pulse, pulseAnim]);

  // Scale animation on mount
  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [scaleAnim]);

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

  // Danger zone arc (if applicable)
  const dangerPath = dangerPercentage >= 0 && dangerPercentage <= 1 
    ? createArcPath(startAngle + (totalAngle * dangerPercentage), startAngle + totalAngle, radius)
    : null;

  // Indicator position
  const indicatorAngle = startAngle + (totalAngle * percentage);
  const indicatorPos = polarToCartesian(center, center, radius, indicatorAngle);

  // Dynamic font sizes
  const valueFontSize = size * 0.2;
  const unitFontSize = size * 0.08;
  const labelFontSize = size * 0.08;
  const statusFontSize = size * 0.05;

  const showDegreeSymbol = finalUnit === 'C' || finalUnit === '°C';

  return (
    <Animated.View style={[
      styles.container, 
      { 
        width: size + 30,
        transform: [{ scale: scaleAnim }]
      }
    ]}>
      {/* Label with status indicator */}
      <View style={styles.labelContainer}>
        <ThemedText style={[
          styles.label, 
          { 
            color: themeTextColor, 
            fontSize: labelFontSize,
          }
        ]}>
          {label}
        </ThemedText>
        {statusInfo.status !== 'NORMAL' && (
          <View style={[
            styles.statusIcon,
            { backgroundColor: statusInfo.color + '20' }
          ]}>
            <ThemedText style={[styles.statusEmoji, { fontSize: labelFontSize * 0.8 }]}>
              {statusInfo.icon}
            </ThemedText>
          </View>
        )}
      </View>
      
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
            {/* Progress gradient */}
            <LinearGradient id={`progressGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={coldColor} stopOpacity="1" />
              <Stop offset="100%" stopColor={hotColor} stopOpacity="1" />
            </LinearGradient>
            
            {/* Danger gradient */}
            <LinearGradient id={`dangerGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={dangerMarkerColor} stopOpacity="0.9" />
              <Stop offset="100%" stopColor={criticalColor} stopOpacity="1" />
            </LinearGradient>

            {/* Success gradient */}
            <LinearGradient id={`successGradient-${label}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <Stop offset="0%" stopColor={successColor} stopOpacity="0.6" />
              <Stop offset="100%" stopColor={coldColor} stopOpacity="1" />
            </LinearGradient>
          </Defs>

          {/* Outer ring for depth */}
          <Circle
            cx={center}
            cy={center}
            r={radius + strokeWidth / 2}
            stroke={trackBackgroundColor}
            strokeWidth="2"
            fill="none"
            opacity={0.1}
          />

          {/* Background track */}
          <Path
            d={trackPath}
            stroke={trackBackgroundColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={0.2}
          />

          {/* Danger zone track */}
          {dangerPath && (
            <Path
              d={dangerPath}
              stroke={`url(#dangerGradient-${label})`}
              strokeWidth={strokeWidth * 0.6}
              fill="none"
              strokeLinecap="round"
              opacity={0.7}
            />
          )}

          {/* Progress track */}
          <Path
            d={progressPath}
            stroke={
              statusInfo.status === 'CRITICAL' ? criticalColor :
              statusInfo.status === 'WARNING' ? dangerMarkerColor :
              `url(#progressGradient-${label})`
            }
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            opacity={statusInfo.status !== 'NORMAL' ? 0.95 : 0.8}
          />

          {/* Center highlight circle */}
          <Circle
            cx={center}
            cy={center}
            r={radius * 0.25}
            fill={innerCircleFillColor}
            stroke={statusInfo.color}
            strokeWidth="2"
            opacity={0.1}
          />

          {/* Value indicator dot */}
          <Circle
            cx={indicatorPos.x}
            cy={indicatorPos.y}
            r={size * 0.04}
            fill={statusInfo.color}
            stroke={innerCircleFillColor}
            strokeWidth="3"
          />

          {/* Additional indicator ring for emphasis */}
          {statusInfo.status !== 'NORMAL' && (
            <Circle
              cx={indicatorPos.x}
              cy={indicatorPos.y}
              r={size * 0.06}
              fill="none"
              stroke={statusInfo.color}
              strokeWidth="2"
              opacity={0.3}
            />
          )}
        </Svg>

        {/* Center content */}
        <View style={styles.centerContent}>
          <View style={styles.valueContainer}>
            <ThemedText style={[
              styles.valueText, 
              { 
                color: statusInfo.color, 
                fontSize: valueFontSize,
                fontWeight: statusInfo.status !== 'NORMAL' ? '800' : '300'
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
                  opacity: 0.7
                }
              ]}>
                {finalUnit}
              </ThemedText>
            )}
          </View>
        </View>
      </Animated.View>

      {/* Status badge */}
      {statusInfo.status !== 'NORMAL' && (
        <View style={[
          styles.statusBadge, 
          { 
            backgroundColor: statusInfo.color + '15',
            borderColor: statusInfo.color,
          }
        ]}>
          <ThemedText style={[
            styles.statusText, 
            { 
              color: statusInfo.color,
              fontSize: statusFontSize,
              fontWeight: '700'
            }
          ]}>
            {statusInfo.status}
          </ThemedText>
        </View>
      )}

      {/* Range indicators */}
      <View style={styles.rangeContainer}>
        <ThemedText style={[styles.rangeText, { color: themeTextColor, opacity: 0.5 }]}>
          {Math.round(finalMin)}
        </ThemedText>
        <ThemedText style={[styles.rangeText, { color: themeTextColor, opacity: 0.5 }]}>
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
    paddingHorizontal: Layout.spacing.xs,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    gap: Layout.spacing.xs,
  },
  label: {
    fontFamily: 'Montserrat-SemiBold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  statusIcon: {
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  statusEmoji: {
    textAlign: 'center',
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
  valueContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  valueText: {
    fontFamily: 'Montserrat-Light',
    position: 'relative',
    textAlign: 'center',
  },
  degreeSymbol: {
    fontFamily: 'Montserrat-Light',
    position: 'absolute',
    top: -8,
  },
  unitText: {
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginTop: -5,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    marginTop: Layout.spacing.xs,
  },
  statusText: {
    fontFamily: 'Montserrat-SemiBold',
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  rangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '85%',
    marginTop: Layout.spacing.xs,
  },
  rangeText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 9,
  },
});

export default DialGauge;