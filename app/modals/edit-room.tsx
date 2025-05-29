// labwatch-app/app/modals/edit-room.tsx
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import Layout from '@/constants/Layout';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
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
  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground'); // Used for modal dropdown, bottom action
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({ light: '#FF3B30', dark: '#FF453A' }, 'errorText');
  const switchTrackColorTrue = tintColor + '40';
  const switchTrackColorFalse = borderColor;

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
      style={[styles.dropdownItem, { backgroundColor: surfaceColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedModule(item);
        setShowModuleDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>{item.type}</ThemedText>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={[styles.loadingView]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: textColor, marginTop: Layout.spacing.md }]}>
            Loading Room Details...
          </ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  if (!roomId) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.loadingView}>
          <ThemedText style={{ color: errorColor }}>Error: Room ID missing.</ThemedText>
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
              placeholder="Room Name"
              value={roomName}
              onChangeText={setRoomName}
              placeholderTextColor={textSecondaryColor}
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
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={textSecondaryColor}
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
                <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
                  {selectedModule.type}
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedText style={[styles.dropdownPlaceholder, { color: textSecondaryColor }]}>
                Select ESP32 Module (Optional)
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
              thumbColor={isMonitored ? tintColor : textSecondaryColor}
              ios_backgroundColor={switchTrackColorFalse}
              onValueChange={setIsMonitored}
              value={isMonitored}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Bottom Action */}
      <ThemedView style={[styles.bottomAction, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        {isSaving ? (
          <ThemedView style={styles.loadingButton}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={[styles.loadingButtonText, { color: textSecondaryColor }]}>
              Saving Changes...
            </ThemedText>
          </ThemedView>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleUpdateRoom}
          >
            <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
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
          <ThemedView style={[styles.dropdownModal, { backgroundColor: surfaceColor, borderColor: borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select ESP32 Module</ThemedText>
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
    </SafeAreaView>
  );
}

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
    fontFamily: 'Montserrat-Regular', // Ensure this font is available
  },
  
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
  },
  headerButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold', // Ensure this font is available
    fontWeight: Layout.fontWeight.bold,
  },
  
  // Content
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl, // Space between sections
  },
  
  // Sections
  section: {
    backgroundColor: 'transparent', // Key change: No card-like background
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
    fontFamily: 'Montserrat-SemiBold', // Ensure this font is available
    fontWeight: Layout.fontWeight.semibold,
  },
  
  // Input Groups
  inputGroup: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  inputLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium', // Ensure this font is available
    fontWeight: Layout.fontWeight.medium,
    marginBottom: Layout.spacing.sm,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular', // Ensure this font is available
  },
  
  // Dropdown (for selecting ESP32 module in the form)
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
  selectedModuleType: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  
  // Switch
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
  
  // Bottom Action
  bottomAction: {
    padding: Layout.spacing.lg,
    paddingBottom: Layout.spacing.lg + (Layout.isSmallDevice ? 0 : 10), // Adjust for home bar if needed
    borderTopWidth: StyleSheet.hairlineWidth,
     // surfaceColor for the bar itself
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
  
  // Modal for ESP32 selection
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  dropdownModal: {
    maxHeight: SCREEN_WIDTH, // Or a fixed value like 400
    borderTopLeftRadius: Layout.borderRadius.lg, // More pronounced rounding for slide-up modal
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
    maxHeight: 300, // Adjust as needed
  },
  dropdownItem: {
    padding: Layout.spacing.lg,
    // borderBottomWidth will be applied inline
  },
  dropdownItemText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  dropdownItemSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
});