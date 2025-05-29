import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Alert as AlertType } from '@/types/alerts';
import { Incident, UpdateIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { getAlertsForSelector, getIncidentById, getRoomsForSelector, updateIncident } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
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

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Define the severity and status options
const SEVERITY_OPTIONS = [
  { id: 'critical', name: 'Critical', description: 'Severe safety hazard or emergency', icon: 'warning-outline' },
  { id: 'high', name: 'High', description: 'Immediate attention required', icon: 'alert-circle-outline' },
  { id: 'medium', name: 'Medium', description: 'Important but not urgent', icon: 'information-circle-outline' },
  { id: 'low', name: 'Low', description: 'Minor issue or concern', icon: 'checkmark-circle-outline' },
  { id: 'info', name: 'Info', description: 'General information only', icon: 'help-circle-outline' },
];

const STATUS_OPTIONS = [
  { id: 'open', name: 'Open', description: 'Needs attention', icon: 'alert-circle-outline' },
  { id: 'in_progress', name: 'In Progress', description: 'Currently being addressed', icon: 'hourglass-outline' },
  { id: 'resolved', name: 'Resolved', description: 'Issue has been fixed', icon: 'checkmark-circle-outline' },
  { id: 'closed', name: 'Closed', description: 'No further action needed', icon: 'checkbox-outline' },
];

export default function EditIncidentModal() {
  const router = useRouter();
  const { incidentId: incidentIdParam } = useLocalSearchParams<{ incidentId: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [alertId, setAlertId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Incident['status']>('open');
  const [severity, setSeverity] = useState<Incident['severity']>('low');
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  // Selected display objects
  const [selectedAlert, setSelectedAlert] = useState<AlertType | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<typeof SEVERITY_OPTIONS[0] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_OPTIONS[0] | null>(null);

  // Modal visibility states
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Get all theme colors upfront to maintain hook order consistency
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon');
  const textSecondaryColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'tabIconDefault');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');
  const errorTextColor = useThemeColor({}, 'errorText');
  const successTextColor = useThemeColor({}, 'successText');
  const warningTextColor = useThemeColor({}, 'warningText');
  const infoTextColor = useThemeColor({}, 'infoText');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const dropdownModalBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');
  const separatorColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');

  const getSeverityColor = (severityId: string) => {
    switch (severityId) {
      case 'critical':
      case 'high':
        return errorTextColor;
      case 'medium':
        return warningTextColor;
      case 'low':
        return successTextColor;
      case 'info':
        return infoTextColor;
      default:
        return textColor;
    }
  };

  const getStatusColor = (statusId: string) => {
    switch (statusId) {
      case 'open':
        return errorTextColor;
      case 'in_progress':
        return warningTextColor;
      case 'resolved':
        return successTextColor;
      case 'closed':
        return textSecondaryColor;
      default:
        return textColor;
    }
  };

  const fetchIncidentAndSupportingData = useCallback(async () => {
    if (!incidentIdParam) {
        RNAlert.alert("Error", "Incident ID is missing.");
        router.back();
        return;
    }
    setIsDataLoading(true);
    try {
      const [fetchedIncident, fetchedRooms, fetchedAlerts] = await Promise.all([
        getIncidentById(incidentIdParam),
        getRoomsForSelector(),
        getAlertsForSelector()
      ]);

      if (fetchedIncident) {
        setIncident(fetchedIncident);
        setTitle(fetchedIncident.title);
        setDescription(fetchedIncident.description);
        setAlertId(fetchedIncident.alertId || undefined);
        setStatus(fetchedIncident.status);
        setSeverity(fetchedIncident.severity);
        setActionsTaken(fetchedIncident.actionsTaken || []);
        setResolutionDetails(fetchedIncident.resolutionDetails || '');

        // Set selected items for dropdowns
        setSelectedStatus(STATUS_OPTIONS.find(s => s.id === fetchedIncident.status) || null);
        setSelectedSeverity(SEVERITY_OPTIONS.find(s => s.id === fetchedIncident.severity) || null);
        
        if (fetchedIncident.alertId) {
          const relatedAlert = fetchedAlerts.find(a => a.id === fetchedIncident.alertId);
          if (relatedAlert) {
            setSelectedAlert(relatedAlert);
          }
        }
      } else {
        RNAlert.alert("Error", "Incident not found.");
        router.back();
      }
      setRooms(fetchedRooms);
      setAlerts(fetchedAlerts);
    } catch (error) {
      console.error("Error fetching data for edit modal:", error);
      RNAlert.alert("Error", "Could not load data. Please try again.");
      router.back();
    } finally {
      setIsDataLoading(false);
    }
  }, [incidentIdParam, router]);

  useEffect(() => {
    fetchIncidentAndSupportingData();
  }, [fetchIncidentAndSupportingData]);

  const handleAddAction = () => {
    if (currentAction.trim()) {
      setActionsTaken([...actionsTaken, currentAction.trim()]);
      setCurrentAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActionsTaken(actionsTaken.filter((_, i) => i !== index));
  };

  const handleUpdateIncident = async () => {
    if (!incident) {
        RNAlert.alert("Error", "Incident data is not loaded.");
        return;
    }
    if (!title.trim() || !description.trim()) {
      RNAlert.alert("Missing Information", "Please fill out title and description.");
      return;
    }
    setIsLoading(true);
    try {
      const incidentUpdates: UpdateIncident = {
        title,
        description,
        alertId: alertId || undefined, // Use undefined instead of null to match the type
        status,
        severity,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined, // Use undefined instead of null
        resolutionDetails: resolutionDetails.trim() || undefined, // Use undefined instead of null
      };

      await updateIncident(incident.id, incidentUpdates);
      RNAlert.alert(
        "Incident Updated",
        `Incident "${title}" has been successfully updated.`,
        [{
          text: "OK",
          onPress: () => {
            setIsLoading(false);
            requestAnimationFrame(() => {
                if (router.canGoBack()) router.back();
                else router.replace(`/(tabs)/incidents/${incident.id}`);
            });
          }
        }]
      );
    } catch (error) {
      console.error("Error updating incident:", error);
      RNAlert.alert("Error", "Failed to update incident. Please try again.");
      setIsLoading(false);
    }
  };

  if (isDataLoading || !incident) {
    return (
        <ThemedView style={[styles.container, {justifyContent: 'center', alignItems: 'center', backgroundColor}]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={{marginTop: Layout.spacing.md, color: textColor}}>Loading incident data...</ThemedText>
        </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Edit Incident' }} />
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
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={placeholderTextColor}
            />
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Description</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
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
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Room (Cannot be changed)</ThemedText>
            <ThemedView style={[styles.infoBox, { backgroundColor: inputBackgroundColor, borderColor }]}>
              <ThemedText style={[styles.infoText, {color: textColor}]}>
                {incident.roomName || incident.roomId}
              </ThemedText>
            </ThemedView>
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
                <ThemedView style={styles.selectedModuleContent}>
                  <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                    {selectedAlert.type}
                  </ThemedText>
                  <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
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
              {selectedStatus ? (
                <ThemedView style={styles.selectedModuleContent}>
                  <ThemedView style={styles.selectedWithIcon}>
                    <Ionicons 
                      name={selectedStatus.icon as keyof typeof Ionicons.glyphMap} 
                      size={22} 
                      color={getStatusColor(selectedStatus.id)} 
                      style={styles.moduleIcon} 
                    />
                    <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                      {selectedStatus.name}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
                    {selectedStatus.description}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                  Select Status
                </ThemedText>
              )}
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
              {selectedSeverity ? (
                <ThemedView style={styles.selectedModuleContent}>
                  <ThemedView style={styles.selectedWithIcon}>
                    <Ionicons 
                      name={selectedSeverity.icon as keyof typeof Ionicons.glyphMap} 
                      size={22} 
                      color={getSeverityColor(selectedSeverity.id)} 
                      style={styles.moduleIcon} 
                    />
                    <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                      {selectedSeverity.name}
                    </ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
                    {selectedSeverity.description}
                  </ThemedText>
                </ThemedView>
              ) : (
                <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                  Select Severity
                </ThemedText>
              )}
              <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>

        {/* Actions Taken Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="construct-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Actions Taken</ThemedText>
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

        {/* Resolution Details Section */}
        <ThemedView style={[styles.section]}>
          <ThemedView style={styles.sectionHeader}>
            <Ionicons name="checkmark-done-circle-outline" size={20} color={tintColor} />
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Resolution Details (Optional)</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.inputGroup}>
            <ThemedText style={[styles.inputLabel, { color: textColor }]}>Resolution</ThemedText>
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="Describe how the incident was resolved..."
              value={resolutionDetails}
              onChangeText={setResolutionDetails}
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={3}
            />
          </ThemedView>
        </ThemedView>
      </ScrollView>

      {/* Bottom Action */}
      <ThemedView style={[styles.bottomAction, { backgroundColor: surfaceColor, borderTopColor: borderColor }]}>
        {isLoading ? (
          <ThemedView style={styles.loadingButton}>
            <ActivityIndicator size="small" color={tintColor} />
            <ThemedText style={[styles.loadingButtonText, { color: placeholderTextColor }]}>
              Updating Incident...
            </ThemedText>
          </ThemedView>
        ) : (
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: tintColor }]}
            onPress={handleUpdateIncident}
          >
            <ThemedText style={styles.primaryButtonText}>Save Changes</ThemedText>
          </TouchableOpacity>
        )}
      </ThemedView>

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
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Related Alert</ThemedText>
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
            
            {alerts.length === 0 ? (
              <ThemedView style={styles.emptyListContainer}>
                <Ionicons name="notifications-off-outline" size={40} color={textSecondaryColor} />
                <ThemedText style={[styles.emptyListText, { color: textColor }]}>
                  No alerts available
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={alerts}
                keyExtractor={(item) => item.id}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.moduleItem, { borderBottomColor: separatorColor }]}
                    onPress={() => {
                      setSelectedAlert(item);
                      setAlertId(item.id);
                      setShowAlertDropdown(false);
                    }}
                  >
                    <ThemedView style={styles.moduleItemContent}>
                      <Ionicons 
                        name="notifications-outline" 
                        size={24} 
                        color={tintColor} 
                        style={styles.moduleItemIcon} 
                      />
                      <ThemedView style={styles.moduleItemTextContainer}>
                        <ThemedText style={[styles.moduleItemName, { color: textColor }]}>
                          {item.type}
                        </ThemedText>
                        <ThemedText style={[styles.moduleItemType, { color: textSecondaryColor }]}>
                          {new Date(item.timestamp).toLocaleString()}
                        </ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </TouchableOpacity>
                )}
              />
            )}
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
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Severity Level</ThemedText>
            </ThemedView>
            
            <FlatList
              data={SEVERITY_OPTIONS}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.moduleItem, { borderBottomColor: separatorColor }]}
                  onPress={() => {
                    setSelectedSeverity(item);
                    setSeverity(item.id as Incident['severity']);
                    setShowSeverityDropdown(false);
                  }}
                >
                  <ThemedView style={styles.moduleItemContent}>
                    <Ionicons 
                      name={item.icon as keyof typeof Ionicons.glyphMap} 
                      size={24} 
                      color={getSeverityColor(item.id)} 
                      style={styles.moduleItemIcon} 
                    />
                    <ThemedView style={styles.moduleItemTextContainer}>
                      <ThemedText style={[styles.moduleItemName, { color: textColor }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.moduleItemType, { color: textSecondaryColor }]}>
                        {item.description}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              )}
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
              <ThemedText style={[styles.dropdownTitle, { color: textColor }]}>Select Incident Status</ThemedText>
            </ThemedView>
            
            <FlatList
              data={STATUS_OPTIONS}
              keyExtractor={(item) => item.id}
              style={styles.dropdownList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.moduleItem, { borderBottomColor: separatorColor }]}
                  onPress={() => {
                    setSelectedStatus(item);
                    setStatus(item.id as Incident['status']);
                    setShowStatusDropdown(false);
                  }}
                >
                  <ThemedView style={styles.moduleItemContent}>
                    <Ionicons 
                      name={item.icon as keyof typeof Ionicons.glyphMap} 
                      size={24} 
                      color={getStatusColor(item.id)} 
                      style={styles.moduleItemIcon} 
                    />
                    <ThemedView style={styles.moduleItemTextContainer}>
                      <ThemedText style={[styles.moduleItemName, { color: textColor }]}>
                        {item.name}
                      </ThemedText>
                      <ThemedText style={[styles.moduleItemType, { color: textSecondaryColor }]}>
                        {item.description}
                      </ThemedText>
                    </ThemedView>
                  </ThemedView>
                </TouchableOpacity>
              )}
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
  
  // Info display
  infoBox: {
    minHeight: 52,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    justifyContent: 'center',
  },
  infoText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
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
  selectedWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  moduleIcon: {
    marginRight: Layout.spacing.sm,
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
  
  // Modal for Dropdowns (updated to match add-room style)
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
  },
  dropdownTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: Layout.fontWeight.semibold,
  },
  clearButton: {
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.sm,
  },
  clearButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  dropdownList: {
    maxHeight: SCREEN_WIDTH * 0.7,
  },
  
  // Module item style (from add-room)
  moduleItem: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
  },
  moduleItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moduleItemIcon: {
    marginRight: Layout.spacing.md,
  },
  moduleItemTextContainer: {
    flex: 1,
  },
  moduleItemName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    fontWeight: Layout.fontWeight.medium,
    marginBottom: 2,
  },
  moduleItemType: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  
  // Empty list state
  emptyListContainer: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyListText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
});