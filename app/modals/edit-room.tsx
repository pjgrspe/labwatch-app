// labwatch-app/app/modals/edit-room.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
// Corrected import for RoomService
import { RoomService } from '@/modules/rooms/services/RoomService';
import { Room } from '@/types/rooms'; // Import Room type
import { Esp32Device, getAvailableEsp32DeviceIds } from '@/utils/firebaseUtils'; // For RTDB IDs
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  TouchableOpacity
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function EditRoomModal() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>(); 

  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [isMonitored, setIsMonitored] = useState(true);
  
  const [selectedModule, setSelectedModule] = useState<Esp32Device | null>(null);
  const [esp32DevicesList, setEsp32DevicesList] = useState<Esp32Device[]>([]);
  const [isLoadingRoomAndEsp32List, setIsLoadingRoomAndEsp32List] = useState(true);
  const [currentRoomOriginalEsp32Id, setCurrentRoomOriginalEsp32Id] = useState<string | undefined>(undefined);

  const [isSaving, setIsSaving] = useState(false);
  const [showModuleDropdown, setShowModuleDropdown] = useState(false);

  const backgroundColor = useThemeColor({}, 'background');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const textSecondaryColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({ light: '#FF3B30', dark: '#FF453A' }, 'errorText');
  const switchTrackColorTrue = tintColor + '40';
  const switchTrackColorFalse = borderColor;
  const dropdownModalBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');


  useEffect(() => {
    if (!roomId) {
      Alert.alert("Error", "No Room ID provided.");
      router.back();
      setIsLoadingRoomAndEsp32List(false);
      return;
    }

    const loadInitialData = async () => {
      setIsLoadingRoomAndEsp32List(true);
      try {
        const roomData = await RoomService.getRoomById(roomId);
        if (!roomData) {
          Alert.alert("Error", "Room not found.");
          router.back();
          throw new Error("Room not found for edit");
        }
        setRoomName(roomData.name);
        setLocation(roomData.location);
        setIsMonitored(roomData.isMonitored);
        setCurrentRoomOriginalEsp32Id(roomData.esp32ModuleId);

        const [allPossibleRTDBEsp32s, assignedFirestoreEsp32IdsSet] = await Promise.all([
          getAvailableEsp32DeviceIds(),
          RoomService.getAllEsp32ModuleIdsInUse()
        ]);

        const availableForSelection = allPossibleRTDBEsp32s.filter(device => {
          return device.id === roomData.esp32ModuleId || !assignedFirestoreEsp32IdsSet.has(device.id);
        });
        setEsp32DevicesList(availableForSelection);

        if (roomData.esp32ModuleId) {
          const moduleInList = availableForSelection.find(m => m.id === roomData.esp32ModuleId);
          setSelectedModule(moduleInList || null);
        } else {
          setSelectedModule(null);
        }

      } catch (error) {
        console.error("Error loading initial data for edit room:", error);
        Alert.alert("Error", "Failed to load room details or ESP32 modules.");
      } finally {
        setIsLoadingRoomAndEsp32List(false);
      }
    };

    loadInitialData();
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
       const roomUpdateData: Partial<Omit<Room, 'id' | 'createdAt'>> & { esp32ModuleId?: string | null; esp32ModuleName?: string | null } = {
        name: roomName,
        location,
        isMonitored,
        esp32ModuleId: selectedModule ? selectedModule.id : null,
        esp32ModuleName: selectedModule ? selectedModule.name : null,
      };
      
      await RoomService.updateRoom(roomId, roomUpdateData);
      Alert.alert("Room Updated", `Room "${roomName}" has been successfully updated.`);
      router.back();
    } catch (error) {
      console.error("Error updating room:", error);
      Alert.alert("Error", "Failed to update room. Please try again.");
    } finally {
      setIsSaving(false);
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
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
    </TouchableOpacity>
  );

  if (isLoadingRoomAndEsp32List) {
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

  if (!roomId && !isLoadingRoomAndEsp32List) { 
    return (
      <SafeAreaView style={[styles.container, { backgroundColor }]}>
        <ThemedView style={styles.loadingView}>
          <ThemedText style={{ color: errorColor }}>Error: Room ID missing or room not found.</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView 
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
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
              style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor, borderColor: borderColor }]}
              placeholder="Room Name"
              value={roomName}
              onChangeText={setRoomName}
              placeholderTextColor={textSecondaryColor}
            />
          </ThemedView>

          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Location</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor, borderColor: borderColor }]}
              placeholder="Location"
              value={location}
              onChangeText={setLocation}
              placeholderTextColor={textSecondaryColor}
            />
          </ThemedView>
        </ThemedView>

        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="hardware-chip-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>ESP32 Sensor Module</ThemedText>
          </ThemedView>
          
          <TouchableOpacity
            style={[styles.dropdown, { backgroundColor: inputBackgroundColor, borderColor: borderColor }]}
            onPress={() => setShowModuleDropdown(true)}
          >
            {selectedModule ? (
              <ThemedView style={styles.selectedModuleContent}>
                <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                  {selectedModule.name}
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedText style={[styles.dropdownPlaceholder, { color: textSecondaryColor }]}>
                Select ESP32 Device ID (Optional)
              </ThemedText>
            )}
            <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
          </TouchableOpacity>
        </ThemedView>

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
          </ThemedView>        </ThemedView>
      </ScrollView>

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
            disabled={isLoadingRoomAndEsp32List}
          >
            <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>
      </KeyboardAvoidingView>

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
             {esp32DevicesList.length === 0 ? (
                <ThemedView style={styles.emptyListContainer}>
                     {/* Corrected icon name from hardware-chip-off-outline to hardware-chip-outline */}
                     <Ionicons name="hardware-chip-outline" size={40} color={textSecondaryColor}/>
                    <ThemedText style={[styles.emptyListText, {color: textColor}]}>
                        No other ESP32 devices available.
                    </ThemedText>
                    <ThemedText style={[styles.emptyListSubText, {color: textSecondaryColor}]}>
                        All registered ESP32s might be in use or none are registered in RTDB.
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
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
  },  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl, // Space between sections
    paddingBottom: Layout.spacing.lg + 30, // Extra padding for keyboard
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