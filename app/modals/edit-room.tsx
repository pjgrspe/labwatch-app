// labwatch-app/app/modals/edit-room.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView, View } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RoomService } from '@/modules/rooms/services/RoomService'; // Adjust path
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Switch, TextInput } from 'react-native';

export default function EditRoomModal() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [isMonitored, setIsMonitored] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Start true to load initial data
  const [isSaving, setIsSaving] = useState(false);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({light: '#FFFFFF', dark: '#2C2C2E'}, 'inputBackground');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'borderColor');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'tint');
  const titleColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({}, 'text');
  const switchThumbColorEnabled = useThemeColor({}, 'tint');
  const switchThumbColorDisabled = useThemeColor({}, 'icon');
  const switchTrackColorTrue = useThemeColor({ light: "#81b0ff", dark: "#585858" }, 'tint');
  const switchTrackColorFalse = useThemeColor({ light: "#767577", dark: "#3e3e3e" }, 'icon');
  const errorTextColor = useThemeColor({}, 'errorText');


  useEffect(() => {
    if (roomId) {
      const fetchRoomData = async () => {
        setIsLoading(true);
        try {
          const roomData = await RoomService.getRoomById(roomId);
          if (roomData) {
            setRoomName(roomData.name);
            setLocation(roomData.location);
            setIsMonitored(roomData.isMonitored);
          } else {
            Alert.alert("Error", "Room not found.");
            router.back();
          }
        } catch (error) {
          console.error("Error fetching room data:", error);
          Alert.alert("Error", "Failed to load room details.");
          router.back();
        } finally {
          setIsLoading(false);
        }
      };
      fetchRoomData();
    } else {
        Alert.alert("Error", "No Room ID provided.");
        router.back();
        setIsLoading(false);
    }
  }, [roomId, router]);

  const handleUpdateRoom = async () => {
    if (!roomId) {
      Alert.alert("Error", "Room ID is missing.");
      return;
    }
    if (!roomName.trim() || !location.trim()) {
      Alert.alert("Missing Information", "Please fill out both room name and location.");
      return;
    }
    setIsSaving(true);
    try {
      await RoomService.updateRoom(roomId, { name: roomName, location, isMonitored });
      Alert.alert("Room Updated", `Room "${roomName}" has been successfully updated.`);
      router.back();
    } catch (error) {
      console.error("Error updating room:", error);
      Alert.alert("Error", "Failed to update room. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={buttonBackgroundColor} />
        <ThemedText style={{marginTop: 10, color: titleColor}}>Loading Room Details...</ThemedText>
      </ThemedView>
    );
  }
   if (!roomId) { // Should be caught by useEffect, but as a fallback
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ThemedText style={{ color: errorTextColor }}>Error: Room ID missing.</ThemedText>
      </ThemedView>
    );
  }


  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <Card style={styles.card}>
        <ThemedText style={[styles.title, { color: titleColor }]}>Edit Room</ThemedText>
        <TextInput
          style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
          placeholder="Room Name"
          value={roomName}
          onChangeText={setRoomName}
          placeholderTextColor={placeholderTextColor}
        />
        <TextInput
          style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
          placeholder="Location"
          value={location}
          onChangeText={setLocation}
          placeholderTextColor={placeholderTextColor}
        />
        <View style={styles.switchContainer}>
          <ThemedText style={[styles.label, {color: labelColor}]}>Monitor this room?</ThemedText>
          <Switch
            trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
            thumbColor={isMonitored ? switchThumbColorEnabled : switchThumbColorDisabled}
            ios_backgroundColor={switchTrackColorFalse}
            onValueChange={setIsMonitored}
            value={isMonitored}
          />
        </View>

        {isSaving ? (
          <ActivityIndicator size="large" color={buttonBackgroundColor} style={{marginTop: Layout.spacing.md}}/>
        ) : (
         <ThemedView style={styles.buttonWrapper}>
            <Button title="Save Changes" onPress={handleUpdateRoom} color={buttonBackgroundColor} />
         </ThemedView>
        )}
      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  centered: {
      justifyContent: 'center',
      alignItems: 'center',
  },
  card: {
    padding: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xl,
    fontWeight: Layout.fontWeight.bold,
    marginBottom: Layout.spacing.lg,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    marginBottom: Layout.spacing.md,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    marginTop: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.xs,
  },
  label: {
    fontSize: Layout.fontSize.md,
    marginRight: Layout.spacing.md,
  },
   buttonWrapper: {
      marginTop: Layout.spacing.sm,
      borderRadius: Layout.borderRadius.sm,
      overflow: 'hidden',
  }
});