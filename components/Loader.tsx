// components/Loader.tsx
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import React from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { View as ThemedView } from './Themed';

interface LoaderProps {
  size?: 'small' | 'large';
  style?: object;
}

const Loader: React.FC<LoaderProps> = ({ size = 'large', style }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  return (
    <ThemedView style={[styles.container, { backgroundColor }, style]}>
      <ActivityIndicator size={size} color={tintColor} />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
});

export default Loader;