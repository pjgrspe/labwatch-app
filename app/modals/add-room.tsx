// labwatch-app/app/modals/add-room.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Rooms } from '@/modules';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity
} from 'react-native';

// Import the new utility function and type
import { Esp32Device, getAvailableEsp32DeviceIds } from '@/utils/firebaseUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function AddRoomModal() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [isMonitored, setIsMonitored] = useState(true);
  
  // State for ESP32 devices
  const [selectedModule, setSelectedModule] = useState<Esp32Device | null>(null);
  const [esp32DevicesList, setEsp32DevicesList] = useState<Esp32Device[]>([]);
  const [isLoadingEsp32List, setIsLoadingEsp32List] = useState(true);

  const [isLoading, setIsLoading] = useState(false); // For the main add room action
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground'); 
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon'); 
  const textSecondaryColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const switchThumbColorEnabled = tintColor;
  const switchThumbColorDisabled = useThemeColor({ light: '#FFFFFF', dark: '#39393D' }, 'icon');
  const switchTrackColorTrue = tintColor + '40'; 
  const switchTrackColorFalse = borderColor;     
  const dropdownModalBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');

  useEffect(() => {
    const fetchDeviceIds = async () => {
      setIsLoadingEsp32List(true);
      try {
        const devices = await getAvailableEsp32DeviceIds();
        setEsp32DevicesList(devices);
      } catch (error) {
        console.error("Failed to fetch ESP32 device IDs:", error);
        Alert.alert("Error", "Could not load available ESP32 modules. Please ensure your Firebase Realtime Database is configured and accessible.");
      } finally {
        setIsLoadingEsp32List(false);
      }
    };
    fetchDeviceIds();
  }, []);

  const handleAddRoom = async () => {
    if (!roomName.trim() || !location.trim()) {
      Alert.alert("Missing Information", "Please fill out both room name and location.");
      return;
    }
    setIsLoading(true);
    try {
      const roomData: any = { // Use 'any' or a more specific type if needed for RoomService
        name: roomName,
        location,
        isMonitored,
      };
      if (selectedModule) {
        roomData.esp32ModuleId = selectedModule.id;
        roomData.esp32ModuleName = selectedModule.name; // Name is the ID itself
      }
      
      await Rooms.RoomService.addRoom(roomData);
      Alert.alert(
        "Room Added",
        `Room "${roomName}" has been successfully added.`,
        [
          {
            text: "OK",
            onPress: () => {
              setIsLoading(false);
              global.requestAnimationFrame(() => { // Ensure router action happens after state update
                if (router.canGoBack()) {
                  router.back();
                } else {
                  // Fallback if canGoBack is false (e.g., deep link)
                  router.replace('/(tabs)/rooms'); 
                }
              });
            }
          }
        ]
      );
    } catch (error) {
      console.error("Error adding room:", error);
      Alert.alert("Error", "Failed to add room. Please try again.");
      setIsLoading(false);
    }
  };

  const renderModuleItem = ({ item }: { item: Esp32Device }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedModule(item);
        setShowModuleDropdown(false);
      }}
    >
      {/* Displaying the ID as the primary identifier */}
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      {/* You can add a subtext if there's more info, e.g., "ESP32 Device" */}
      {/* <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>ESP32 Device</ThemedText> */}
    </TouchableOpacity>
  );
  
  if (isLoadingEsp32List) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={[styles.loadingView]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: textColor, marginTop: Layout.spacing.md }]}>
            Loading ESP32 Modules...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Room Information Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Room Information</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Room Name</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: inputBackgroundColor, 
                color: textColor, 
                borderColor: borderColor 
              }]}
              placeholder="e.g., Lab Alpha, Chemistry Lab 1"
              value={roomName}
              onChangeText={setRoomName}
              placeholderTextColor={placeholderTextColor}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Location</ThemedText>
            <TextInput
              style={[styles.input, { 
                backgroundColor: inputBackgroundColor, 
                color: textColor, 
                borderColor: borderColor 
              }]}
              placeholder="e.g., Building A, Floor 2, Room 201"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={placeholderTextColor}
            />
          </ThemedView>
        </ThemedView>

        {/* ESP32 Module Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="hardware-chip-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>ESP32 Sensor Module</ThemedText>
          </ThemedView>
          
          <TouchableOpacity
            style={[styles.dropdown, { 
              backgroundColor: inputBackgroundColor, 
              borderColor: borderColor 
            }]}
            onPress={() => setShowModuleDropdown(true)}
          >
            {selectedModule ? (
              <ThemedView style={styles.selectedModuleContent}>
                <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                  {selectedModule.name} 
                </ThemedText>
                {/* Optionally add a subtext if needed, e.g., "Registered ESP32" */}
              </ThemedView>
            ) : (
              <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                Select ESP32 Device ID (Optional)
              </ThemedText>
            )}
            <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
          </TouchableOpacity>
        </ThemedView>

        {/* Monitoring Settings Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="pulse-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Monitoring Settings</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.switchRow}>
            <ThemedView style={styles.switchContent}>
              <ThemedText style={[styles.switchLabel, { color: textColor }]}>Enable Monitoring</ThemedText>
              <ThemedText style={[styles.switchDescription, { color: textSecondaryColor }]}>
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
      </ScrollView>

      {/* Bottom Action */}
      <ThemedView style={[styles.bottomAction, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        {isLoading ? (
          <ThemedView style={styles.loadingButton}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={[styles.loadingButtonText, { color: textSecondaryColor }]}>
              Creating Room...
            </ThemedText>
          </ThemedView>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleAddRoom}
          >
            <ThemedText style={styles.primaryButtonText}>Add Room</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Module Selection Modal */}
      <Modal
        visible={showModuleDropdown}
        transparent={true}
        animationType="slide" 
        onRequestClose={() => setShowModuleDropdown(false)}
      >
        <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setShowModuleDropdown(false)} 
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownModalBackgroundColor, borderColor: borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select ESP32 Device ID</ThemedText>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedModule(null);
                  setShowModuleDropdown(false);
                }}
              >
                <ThemedText style={[styles.clearButtonText, { color: tintColor }]}>Clear</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            {esp32DevicesList.length === 0 ? (
                <ThemedView style={styles.emptyListContainer}>
                    <Ionicons name="hardware-chip-outline" size={40} color={textSecondaryColor}/>
                    <ThemedText style={[styles.emptyListText, {color: textColor}]}>
                        No registered ESP32 devices found in Realtime Database.
                    </ThemedText>
                    <ThemedText style={[styles.emptyListSubText, {color: textSecondaryColor}]}>
                        Ensure devices are sending data to '/esp32_devices_data/'.
                    </ThemedText>
                </ThemedView>
            ) : (
              <FlatList
                data={esp32DevicesList}
                renderItem={renderModuleItem}
                keyExtractor={(item) => item.id}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
              />
            )}
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

// Styles adapted from edit-room.tsx and refined
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl, 
  },
  section: {
    backgroundColor: 'transparent', 
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    gap: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold', 
    fontWeight: Layout.fontWeight.semibold,
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium', 
    fontWeight: Layout.fontWeight.medium,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    height: 52, 
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg, 
    paddingHorizontal: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular', 
  },
  dropdown: {
    minHeight: 52, 
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg, 
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
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
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  selectedModuleType: { // Kept for potential future use, though not used for simple ID list
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'transparent',
    paddingVertical: Layout.spacing.sm, 
  },
  switchContent: {
    flex: 1,
    marginRight: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  switchLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  switchDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 4,
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  bottomAction: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg + (Layout.isSmallDevice ? 0 : 10), 
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  loadingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    backgroundColor: 'transparent',
    gap: Layout.spacing.sm,
  },
  loadingButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  primaryButton: {
    height: 52,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF', 
    fontSize: Layout.fontSize.md, 
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: Layout.fontWeight.semibold,
  },
  modalOverlay: { 
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', 
    justifyContent: 'flex-end', 
  },
  dropdownModal: { 
    maxHeight: SCREEN_WIDTH, 
    borderTopLeftRadius: Layout.borderRadius.lg, 
    borderTopRightRadius: Layout.borderRadius.lg,
    borderWidth: StyleSheet.hairlineWidth,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  dropdownTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: Layout.fontWeight.semibold,
  },
  clearButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
  },
  clearButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  dropdownList: {
    maxHeight: 300, 
  },
  dropdownItem: {
    padding: Layout.spacing.lg,
  },
  dropdownItemText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  dropdownItemSubtext: { // Kept for potential future use
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  emptyListContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150, // Ensure it's not too small
  },
  emptyListText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  emptyListSubText: {
    marginTop: Layout.spacing.xs,
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  }
});