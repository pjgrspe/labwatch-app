// app/modals/add-room.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, TextInput } from 'react-native';

export default function AddRoomModal() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');

  const containerBackgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({light: '#FFFFFF', dark: '#2C2C2E'}, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'borderColor');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'tint');
  const titleColor = useThemeColor({}, 'text');

  const handleAddRoom = () => {
    if (!roomName.trim() || !location.trim()) {
      Alert.alert("Missing Information", "Please fill out both room name and location.");
      return;
    }
    // Here you would typically call an API to add the room
    console.log('Adding room:', { roomName, location });
    Alert.alert("Room Added", `${roomName} at ${location} has been added (simulated).`);
    // Potentially refresh the room list on the previous screen or use global state
    router.back();
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Card>
        <ThemedText style={[styles.title, { color: titleColor }]}>Add New Room</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
          placeholder="Room Name (e.g., Lab Alpha)"
          value={roomName}
          onChangeText={setRoomName}
          placeholderTextColor={placeholderTextColor}
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
          placeholder="Location (e.g., Building A, Floor 1)"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor={placeholderTextColor}
        />
        <Button title="Add Room" onPress={handleAddRoom} color={buttonBackgroundColor} />
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
});