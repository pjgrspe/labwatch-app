// labwatch-app/app/modals/add-incident.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Alert as AlertType } from '@/types/alerts';
import { Incident, NewIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { addIncident, getAlertsForSelector, getRoomsForSelector } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    Modal,
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

// You might want to get the current user's ID/name from your auth context
const MOCK_USER_ID = "SystemUser"; // Replace with actual user identification

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define the severity and status options
const SEVERITY_OPTIONS = [
  { id: 'critical', name: 'Critical', description: 'Severe safety hazard or emergency' },
  { id: 'high', name: 'High', description: 'Immediate attention required' },
  { id: 'medium', name: 'Medium', description: 'Important but not urgent' },
  { id: 'low', name: 'Low', description: 'Minor issue or concern' },
  { id: 'info', name: 'Info', description: 'General information only' },
];

const STATUS_OPTIONS = [
  { id: 'open', name: 'Open', description: 'Needs attention' },
  { id: 'in_progress', name: 'In Progress', description: 'Currently being addressed' },
  { id: 'resolved', name: 'Resolved', description: 'Issue has been fixed' },
  { id: 'closed', name: 'Closed', description: 'No further action needed' },
];

export default function AddIncidentModal() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [alertId, setAlertId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Incident['status']>('open');
  const [severity, setSeverity] = useState<Incident['severity']>('low');
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');

  // Selected display objects
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState(SEVERITY_OPTIONS.find(s => s.id === 'low') || SEVERITY_OPTIONS[3]);
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS.find(s => s.id === 'open') || STATUS_OPTIONS[0]);

  // Modal visibility states
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon');
  const textSecondaryColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');
  const errorTextColor = useThemeColor({}, 'errorText');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const dropdownModalBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');

  const fetchRequiredData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [fetchedRooms, fetchedAlerts] = await Promise.all([
        getRoomsForSelector(),
        getAlertsForSelector()
      ]);
      setRooms(fetchedRooms);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching data for modal:", error);
      RNAlert.alert("Error", "Could not load necessary data. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRequiredData();
  }, [fetchRequiredData]);

  const handleAddAction = () => {
    if (currentAction.trim()) {
      setActionsTaken([...actionsTaken, currentAction.trim()]);
      setCurrentAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActionsTaken(actionsTaken.filter((_, i) => i !== index));
  };

  const handleAddIncident = async () => {
    if (!title.trim() || !description.trim() || !roomId) {
      RNAlert.alert("Missing Information", "Please fill out title, description, and select a room.");
      return;
    }
    setIsLoading(true);
    try {
      const incidentData: NewIncident = {
        title,
        description,
        roomId,
        roomName: selectedRoom?.name,
        alertId: alertId || undefined,
        reportedBy: MOCK_USER_ID,
        status,
        severity,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
      };

      await addIncident(incidentData);
      RNAlert.alert(
        "Incident Reported",
        `Incident "${title}" has been successfully reported.`,
        [{
          text: "OK",
          onPress: () => {
            setIsLoading(false);
            requestAnimationFrame(() => {
                if (router.canGoBack()) router.back();
                else router.dismiss();
            });
          }
        }]
      );
    } catch (error) {
      console.error("Error adding incident:", error);
      RNAlert.alert("Error", "Failed to report incident. Please try again.");
      setIsLoading(false);
    }
  };

  // Render functions for dropdowns
  const renderRoomItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedRoom(item);
        setRoomId(item.id);
        setShowRoomDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>{item.location}</ThemedText>
    </TouchableOpacity>
  );

  const renderAlertItem = ({ item }: { item: AlertType }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedAlert(item);
        setAlertId(item.id);
        setShowAlertDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.type}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>
        {new Date(item.timestamp).toLocaleString()}
      </ThemedText>
    </TouchableOpacity>
  );

  const renderSeverityItem = ({ item }: { item: typeof SEVERITY_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedSeverity(item);
        setSeverity(item.id as Incident['severity']);
        setShowSeverityDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>{item.description}</ThemedText>
    </TouchableOpacity>
  );

  const renderStatusItem = ({ item }: { item: typeof STATUS_OPTIONS[0] }) => (
    <TouchableOpacity
      style={[styles.dropdownItem, { backgroundColor: dropdownModalBackgroundColor, borderBottomColor: borderColor, borderBottomWidth: StyleSheet.hairlineWidth }]}
      onPress={() => {
        setSelectedStatus(item);
        setStatus(item.id as Incident['status']);
        setShowStatusDropdown(false);
      }}
    >
      <ThemedText style={[styles.dropdownItemText, { color: textColor }]}>{item.name}</ThemedText>
      <ThemedText style={[styles.dropdownItemSubtext, { color: textSecondaryColor }]}>{item.description}</ThemedText>
    </TouchableOpacity>
  );

  if (isDataLoading) {
    return (
        <ThemedView style={[styles.container, {justifyContent: 'center', alignItems: 'center', backgroundColor}]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={{marginTop: Layout.spacing.md, color: textColor}}>Loading data...</ThemedText>
        </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Report New Incident' }} />
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Incident Information Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="information-circle-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Incident Details</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Title</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="e.g., Chemical Spill, Equipment Failure"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={placeholderTextColor}
            />
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="Provide a detailed description of the incident..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={4}
            />
          </ThemedView>
        </ThemedView>

        {/* Association Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="link-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Associations</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Room (Required)</ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: inputBackgroundColor, 
                borderColor: borderColor 
              }]}
              onPress={() => setShowRoomDropdown(true)}
            >
              {selectedRoom ? (
                <ThemedView style={styles.selectedContent}>
                  <ThemedText style={[styles.selectedText, { color: textColor }]}>
                    {selectedRoom.name}
                  </ThemedText>
                  <ThemedText style={[styles.selectedSubtext, { color: textSecondaryColor }]}>
                    {selectedRoom.location}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                  Select Room (Required)
                </ThemedText>
              )}
              <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Related Alert (Optional)</ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: inputBackgroundColor, 
                borderColor: borderColor 
              }]}
              onPress={() => setShowAlertDropdown(true)}
            >
              {selectedAlert ? (
                <ThemedView style={styles.selectedContent}>
                  <ThemedText style={[styles.selectedText, { color: textColor }]}>
                    {selectedAlert.type}
                  </ThemedText>
                  <ThemedText style={[styles.selectedSubtext, { color: textSecondaryColor }]}>
                    {new Date(selectedAlert.timestamp).toLocaleString()}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                  Select Related Alert (Optional)
                </ThemedText>
              )}
              <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Status & Severity Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="options-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Status & Severity</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Status</ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: inputBackgroundColor, 
                borderColor: borderColor 
              }]}
              onPress={() => setShowStatusDropdown(true)}
            >
              <ThemedView style={styles.selectedContent}>
                <ThemedText style={[styles.selectedText, { color: textColor }]}>
                  {selectedStatus.name}
                </ThemedText>
                <ThemedText style={[styles.selectedSubtext, { color: textSecondaryColor }]}>
                  {selectedStatus.description}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Severity</ThemedText>
            <TouchableOpacity
              style={[styles.dropdown, { 
                backgroundColor: inputBackgroundColor, 
                borderColor: borderColor 
              }]}
              onPress={() => setShowSeverityDropdown(true)}
            >
              <ThemedView style={styles.selectedContent}>
                <ThemedText style={[styles.selectedText, { color: textColor }]}>
                  {selectedSeverity.name}
                </ThemedText>
                <ThemedText style={[styles.selectedSubtext, { color: textSecondaryColor }]}>
                  {selectedSeverity.description}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Actions Taken Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Actions Taken (Optional)</ThemedText>
          </ThemedView>
          
          {actionsTaken.map((action, index) => (
            <ThemedView key={index} style={[styles.actionItemContainer, {borderColor}]}>
              <ThemedText style={[styles.actionText, {color: textColor}]}>{action}</ThemedText>
              <TouchableOpacity onPress={() => handleRemoveAction(index)}>
                <Ionicons name="trash-bin-outline" size={20} color={errorTextColor} />
              </TouchableOpacity>
            </ThemedView>
          ))}
          
          <ThemedView style={styles.inputRow}>
            <TextInput
              style={[styles.input, styles.actionInput, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="Describe an action taken"
              value={currentAction}
              onChangeText={setCurrentAction}
              placeholderTextColor={placeholderTextColor}
            />
            <TouchableOpacity style={[styles.addButtonSmall, {backgroundColor: tintColor}]} onPress={handleAddAction}>
              <Ionicons name="add-outline" size={20} color={primaryButtonTextColor} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Bottom Action */}
      <ThemedView style={[styles.bottomAction, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        {isLoading ? (
          <ThemedView style={styles.loadingButton}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={[styles.loadingButtonText, { color: placeholderTextColor }]}>
              Reporting Incident...
            </ThemedText>
          </ThemedView>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleAddIncident}
          >
            <ThemedText style={styles.primaryButtonText}>Report Incident</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Room Selection Modal */}
      <Modal
        visible={showRoomDropdown}
        transparent={true}
        animationType="slide" 
        onRequestClose={() => setShowRoomDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowRoomDropdown(false)} 
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownModalBackgroundColor, borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Room</ThemedText>
            </ThemedView>
            <FlatList
              data={rooms}
              renderItem={renderRoomItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      {/* Alert Selection Modal */}
      <Modal
        visible={showAlertDropdown}
        transparent={true}
        animationType="slide" 
        onRequestClose={() => setShowAlertDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowAlertDropdown(false)} 
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownModalBackgroundColor, borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Alert</ThemedText>
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedAlert(null);
                  setAlertId(undefined);
                  setShowAlertDropdown(false);
                }}
              >
                <ThemedText style={[styles.clearButtonText, { color: tintColor }]}>Clear</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <FlatList
              data={alerts}
              renderItem={renderAlertItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      {/* Severity Selection Modal */}
      <Modal
        visible={showSeverityDropdown}
        transparent={true}
        animationType="slide" 
        onRequestClose={() => setShowSeverityDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowSeverityDropdown(false)} 
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownModalBackgroundColor, borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Severity</ThemedText>
            </ThemedView>
            <FlatList
              data={SEVERITY_OPTIONS}
              renderItem={renderSeverityItem}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>

      {/* Status Selection Modal */}
      <Modal
        visible={showStatusDropdown}
        transparent={true}
        animationType="slide" 
        onRequestClose={() => setShowStatusDropdown(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowStatusDropdown(false)} 
        >
          <ThemedView style={[styles.dropdownModal, { backgroundColor: dropdownModalBackgroundColor, borderColor }]}>
            <ThemedView style={[styles.dropdownHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Status</ThemedText>
            </ThemedView>
            <FlatList
              data={STATUS_OPTIONS}
              renderItem={renderStatusItem}
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
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl,
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
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  
  // Dropdown (for selection fields)
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
  selectedContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  selectedText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
  },
  selectedSubtext: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginTop: 2,
  },
  dropdownPlaceholder: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  
  // Action items
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  actionInput: {
    flex: 1,
  },
  addButtonSmall: {
    width: 52,
    height: 52,
    borderRadius: Layout.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionItemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md
  },
  actionText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
    marginRight: Layout.spacing.sm,
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
  
  // Modal for Dropdowns
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