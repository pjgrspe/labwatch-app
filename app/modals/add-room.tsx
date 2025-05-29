// labwatch-app/app/modals/add-room.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Rooms } from '@/modules';
import { Ionicons } from '@expo/vector-icons'; // Added for header icon
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  SafeAreaView, // Changed from ThemedView for consistency
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

export default function AddRoomModal() {
  const router = useRouter();
  const [roomName, setRoomName] = useState('');
  const [location, setLocation] = useState('');
  const [isMonitored, setIsMonitored] = useState(true);
  const [selectedModule, setSelectedModule] = useState<typeof ESP32_MODULES[0] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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

  const handleAddRoom = async () => {
    if (!roomName.trim() || !location.trim()) {
      Alert.alert("Missing Information", "Please fill out both room name and location.");
      return;
    }
    setIsLoading(true);
    try {
      const roomData = {
        name: roomName,
        location,
        isMonitored,
        ...(selectedModule && { esp32ModuleId: selectedModule.id, esp32ModuleName: selectedModule.name })
      };
      
      await Rooms.RoomService.addRoom(roomData);
      Alert.alert(
        "Room Added",
        `Room "${roomName}" has been successfully added.`,
        [
          {
            text: "OK",
            onPress: () => {
              setIsLoading(false);
              global.requestAnimationFrame(() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
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

  const renderModuleItem = ({ item }: { item: typeof ESP32_MODULES[0] }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedModule(item);
        setShowModuleDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>{item.type}</ThemedText>
    </TouchableOpacity>
  );
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
                <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
                  {selectedModule.type}
                </ThemedText>
              </ThemedView>
            ) : (
              <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
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
              thumbColor={isMonitored ? switchThumbColorEnabled : switchThumbColorDisabled}
              ios_backgroundColor={switchTrackColorFalse}
              onValueChange={setIsMonitored}
              value={isMonitored}
            />
          </ThemedView>        </ThemedView>
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
      </KeyboardAvoidingView>

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

// Styles adapted from edit-room.tsx and refined
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
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
    fontFamily: 'Montserrat-Bold', 
    fontWeight: Layout.fontWeight.bold,
  },
  
  // Content
  content: {
    flex: 1,
  },  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl,
    paddingBottom: Layout.spacing.lg + 30, // Extra padding for keyboard
  },
  
  // Sections
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
  
  // Input Groups
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
  
  // Bottom Action (Button area)
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
  
  // Modal for ESP32 Module Selection
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
  dropdownItemSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
});