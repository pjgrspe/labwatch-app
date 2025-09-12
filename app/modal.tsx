import { ThemedText, ThemedView } from '@/components';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function ModalScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.title}>Modal</ThemedText>
      <ThemedText>This is a modal screen.</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});