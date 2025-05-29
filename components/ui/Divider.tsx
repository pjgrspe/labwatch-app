// labwatch-app/components/ui/Divider.tsx
import { useThemeColor } from '@/hooks';
import React from 'react';
import { DimensionValue, StyleSheet, View, ViewProps } from 'react-native';
import Typography from '../Typography';

interface DividerProps extends ViewProps {
  orientation?: 'horizontal' | 'vertical';
  thickness?: number;
  length?: DimensionValue;
  color?: string;
  text?: string;
  spaced?: boolean;
}

export default function Divider({
  orientation = 'horizontal',
  thickness = StyleSheet.hairlineWidth,
  length = '100%',
  color,
  text,
  spaced = false,
  style,
  ...props
}: DividerProps) {
  const dividerColor = color || useThemeColor({}, 'borderColor');

  const isHorizontal = orientation === 'horizontal';
  
  const dividerStyle = {
    backgroundColor: dividerColor,
    height: isHorizontal ? thickness : length,
    width: isHorizontal ? length : thickness,
    marginVertical: isHorizontal && spaced ? 16 : 0,
    marginHorizontal: !isHorizontal && spaced ? 16 : 0,
  };

  if (text) {
    return (
      <View style={[styles.container, style]} {...props}>
        <View style={[styles.line, dividerStyle]} />
        <Typography variant="caption" style={styles.text} color={dividerColor}>
          {text}
        </Typography>
        <View style={[styles.line, dividerStyle]} />
      </View>
    );
  }

  return <View style={[dividerStyle, style]} {...props} />;
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  line: {
    flex: 1,
  },
  text: {
    paddingHorizontal: 16,
  },
});
