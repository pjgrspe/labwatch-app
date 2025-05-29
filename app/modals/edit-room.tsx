// labwatch-app/app/modals/edit-room.tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity
} from 'react-native';

// Mock ESP32 modules - replace with actual data source
const ESP32_MODULES = [
  { id: 'esp32_001', name: 'ESP32-001 (Lab Station A)', type: 'Multi-sensor' },
  { id: 'esp32_002', name: 'ESP32-002 (Lab Station B)', type: 'Temperature/Humidity' },
  { id: 'esp32_003', name: 'ESP32-003 (Air Quality Monitor)', type: 'Air Quality' },
  { id: 'esp32_004', name: 'ESP32-004 (Thermal Imaging)', type: 'Thermal Camera' },
  { id: 'esp32_005', name: 'ESP32-005 (Vibration Sensor)', type: 'Vibration' },
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EditRoomModal() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();

  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [isMonitored, setIsMonitored] = useState(true);
  const [selectedModule, setSelectedModule] = useState<typeof ESP32_MODULES[0] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  // Theme colors
  const containerBackgroundColor = useThemeColor({}, 'background');
  const cardBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon');
  const buttonBackgroundColor = useThemeColor({}, 'tint');
  const titleColor = useThemeColor({}, 'text');
  const labelColor = useThemeColor({ light: '#1C1C1E', dark: '#FFFFFF' }, 'text');
  const subtitleColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const errorTextColor = useThemeColor({ light: '#FF3B30', dark: '#FF453A' }, 'errorText');
  const switchThumbColorEnabled = useThemeColor({}, 'tint');
  const switchThumbColorDisabled = useThemeColor({ light: '#FFFFFF', dark: '#39393D' }, 'icon');
  const switchTrackColorTrue = useThemeColor({ light: "#34C759", dark: "#30D158" }, 'tint');
  const switchTrackColorFalse = useThemeColor({ light: "#E9E9EA", dark: "#39393D" }, 'icon');
  const dropdownBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');
  const dropdownBorderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');

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
            
            // Set selected module if exists
            if (roomData.esp32ModuleId) {
              const module = ESP32_MODULES.find(m => m.id === roomData.esp32ModuleId);
              if (module) {
                setSelectedModule(module);
              }
            }
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
      const roomData = {
        name: roomName,
        location,
        isMonitored,
        ...(selectedModule && { esp32ModuleId: selectedModule.id, esp32ModuleName: selectedModule.name })
      };
      
      await RoomService.updateRoom(roomId, roomData);
      Alert.alert("Room Updated", `Room "${roomName}" has been successfully updated.`);
      router.back();
    } catch (error) {
      console.error("Error updating room:", error);
      Alert.alert("Error", "Failed to update room. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const renderModuleItem = ({ item }: { item: typeof ESP32_MODULES[0] }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownBackgroundColor, borderBottomColor: dropdownBorderColor }]}
      onPress={() => {
        setSelectedModule(item);
        setShowModuleDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: labelColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: subtitleColor }]}>{item.type}</ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={buttonBackgroundColor} />
        <ThemedText style={[styles.loadingText, { marginTop: 10, color: titleColor }]}>
          Loading Room Details...
        </ThemedText>
      </ThemedView>
    );
  }

  if (!roomId) {
    return (
      <ThemedView style={[styles.container, styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ThemedText style={{ color: errorTextColor }}>Error: Room ID missing.</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <Card style={[styles.card, { backgroundColor: cardBackgroundColor }]}>
          <ThemedText style={[styles.title, { color: titleColor }]}>Edit Room</ThemedText>
          <ThemedText style={[styles.subtitle, { color: subtitleColor }]}>
            Update room configuration and settings
          </ThemedText>

          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: labelColor }]}>Room Information</ThemedText>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: labelColor }]}>Room Name</ThemedText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: inputBackgroundColor, 
                  color: inputTextColor, 
                  borderColor: inputBorderColor 
                }]}
                placeholder="Room Name"
                value={roomName}
                onChangeText={setRoomName}
                placeholderTextColor={placeholderTextColor}
              />
            </ThemedView>

            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: labelColor }]}>Location</ThemedText>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: inputBackgroundColor, 
                  color: inputTextColor, 
                  borderColor: inputBorderColor 
                }]}
                placeholder="Location"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor={placeholderTextColor}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: labelColor }]}>ESP32 Sensor Module</ThemedText>
            
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: inputBackgroundColor, 
                borderColor: inputBorderColor 
              }]}
              onPress={() => setShowModuleDropdown(true)}
            >
              {selectedModule ? (
                <ThemedView style={styles.selectedModuleContent}>
                  <ThemedText style={[styles.selectedModuleText, { color: inputTextColor }]}>
                    {selectedModule.name}
                  </ThemedText>
                  <ThemedText style={[styles.selectedModuleType, { color: subtitleColor }]}>
                    {selectedModule.type}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                  Select ESP32 Module (Optional)
                </ThemedText>
              )}
              <ThemedText style={[styles.dropdownArrow, { color: subtitleColor }]}>▼</ThemedText>
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={styles.section}>
            <ThemedText style={[styles.sectionLabel, { color: labelColor }]}>Monitoring Settings</ThemedText>
            
            <ThemedView style={[styles.switchContainer, { backgroundColor: 'transparent' }]}>
              <ThemedView style={styles.switchLabelContainer}>
                <ThemedText style={[styles.switchLabel, { color: labelColor }]}>Enable Monitoring</ThemedText>
                <ThemedText style={[styles.switchDescription, { color: subtitleColor }]}>
                  Activate real-time sensor monitoring for this room
                </ThemedText>
              </ThemedView>
              <Switch
                trackColor={{ false: switchTrackColorFalse, true: switchTrackColorTrue }}
                thumbColor={isMonitored ? switchThumbColorEnabled : switchThumbColorDisabled}
                ios_backgroundColor={switchTrackColorFalse}
                onValueChange={setIsMonitored}
                value={isMonitored}
              />
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.buttonSection}>
            {isSaving ? (
              <ThemedView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={buttonBackgroundColor} />
                <ThemedText style={[styles.loadingText, { color: subtitleColor }]}>
                  Saving Changes...
                </ThemedText>
              </ThemedView>
            ) : (
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: buttonBackgroundColor }]}
                onPress={handleUpdateRoom}
              >
                <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
              </TouchableOpacity>
            )}
          </ThemedView>
        </Card>
      </ScrollView>

      {/* Module Selection Modal */}
      <Modal
        visible={showModuleDropdown}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowModuleDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModuleDropdown(false)}
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownBackgroundColor, borderColor: dropdownBorderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: dropdownBorderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: titleColor }]}>Select ESP32 Module</ThemedText>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedModule(null);
                  setShowModuleDropdown(false);
                }}
              >
                <ThemedText style={[styles.clearButtonText, { color: buttonBackgroundColor }]}>Clear</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <FlatList
              data={ESP32_MODULES}
              renderItem={renderModuleItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    padding: Layout.spacing.lg,
  },
  card: {
    padding: Layout.spacing.xl,
    borderRadius: Layout.borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontWeight: Layout.fontWeight.bold,
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    textAlign: 'center',
    marginBottom: Layout.spacing.xl,
  },
  section: {
    marginBottom: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  sectionLabel: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.md,
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
  },
  dropdown: {
    height: 60,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedModuleContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectedModuleText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  selectedModuleType: {
    fontSize: Layout.fontSize.sm,
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: Layout.fontSize.md,
    flex: 1,
  },
  dropdownArrow: {
    fontSize: Layout.fontSize.sm,
    marginLeft: Layout.spacing.sm,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
  },
  switchLabelContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  switchLabel: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  switchDescription: {
    fontSize: Layout.fontSize.sm,
    marginTop: 2,
  },
  buttonSection: {
    marginTop: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
  },
  primaryButton: {
    height: 50,
    borderRadius: Layout.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownModal: {
    width: SCREEN_WIDTH * 0.85,
    maxHeight: 400,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  dropdownTitle: {
    fontSize: Layout.fontSize.lg,
    fontWeight: Layout.fontWeight.semibold,
  },
  clearButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  clearButtonText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  dropdownList: {
    maxHeight: 300,
  },
  dropdownItem: {
    padding: Layout.spacing.lg,
    borderBottomWidth: 1,
  },
  dropdownItemText: {
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.medium,
  },
  dropdownItemSubtext: {
    fontSize: Layout.fontSize.sm,
    marginTop: 2,
  },
});