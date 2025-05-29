// labwatch-app/app/modals/add-incident.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Alert as AlertType } from '@/types/alerts';
import { Incident, NewIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { addIncident, getAlertsForSelector, getRoomsForSelector } from '@/utils/firebaseUtils'; // Or your IncidentService
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker'; // Using Picker for simplicity
import { Stack, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Alert as RNAlert, // Renamed to avoid conflict
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

// You might want to get the current user's ID/name from your auth context
const MOCK_USER_ID = "SystemUser"; // Replace with actual user identification

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

  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);


  // Theme colors (adapt from your add-room.tsx or define as needed)
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');

  const fetchRequiredData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const [fetchedRooms, fetchedAlerts] = await Promise.all([
        getRoomsForSelector(),
        getAlertsForSelector() // You might want to filter alerts (e.g., active ones)
      ]);
      setRooms(fetchedRooms);
      setAlerts(fetchedAlerts);
      if (fetchedRooms.length > 0 && !roomId) { // Pre-select first room if none selected
        // setRoomId(fetchedRooms[0].id);
      }
    } catch (error) {
      console.error("Error fetching data for modal:", error);
      RNAlert.alert("Error", "Could not load necessary data. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  }, [roomId]); // Added roomId to ensure it can set default if needed

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
        roomName: rooms.find(r => r.id === roomId)?.name, // Denormalize room name
        alertId: alertId || undefined, // Ensure it's undefined if not selected
        reportedBy: MOCK_USER_ID, // Replace with actual user data
        status,
        severity,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
      };

      await addIncident(incidentData);      RNAlert.alert(
        "Incident Reported",
        `Incident "${title}" has been successfully reported.`,
        [{
          text: "OK",
          onPress: () => {
            setIsLoading(false);
            // Adding small delay for modal to properly close before navigation potentially re-renders list
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
        <Section icon="information-circle-outline" title="Incident Details">
          <InputGroup label="Title">
            <TextInput
              style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="e.g., Chemical Spill, Equipment Failure"
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={placeholderTextColor}
            />
          </InputGroup>
          <InputGroup label="Description">
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="Provide a detailed description of the incident..."
              value={description}
              onChangeText={setDescription}
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={4}
            />
          </InputGroup>
        </Section>

        {/* Association Section */}
        <Section icon="link-outline" title="Associations">
          <InputGroup label="Room (Required)">
             <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>                <Picker
                selectedValue={roomId}
                onValueChange={(itemValue: string) => setRoomId(itemValue || undefined)}
                style={[styles.picker, { color: textColor, backgroundColor: 'transparent' }]}
                dropdownIconColor={textColor}
                prompt="Select a Room"
                >
                <Picker.Item label="Select a Room..." value={undefined} style={{color: placeholderTextColor}} />
                {rooms.map(room => (
                    <Picker.Item key={room.id} label={room.name} value={room.id} style={{color: textColor}} />
                ))}
                </Picker>
            </PickerWrapper>
          </InputGroup>
          <InputGroup label="Related Alert (Optional)">
             <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>                <Picker
                selectedValue={alertId}
                onValueChange={(itemValue: string) => setAlertId(itemValue || undefined)}
                style={[styles.picker, { color: textColor, backgroundColor: 'transparent' }]}
                dropdownIconColor={textColor}
                prompt="Select an Alert"
                >
                <Picker.Item label="Select a Related Alert (Optional)..." value={undefined} style={{color: placeholderTextColor}}/>
                {alerts.map(alert => (
                    <Picker.Item key={alert.id} label={`${alert.type} - ${new Date(alert.timestamp).toLocaleTimeString()}`} value={alert.id} style={{color: textColor}}/>
                ))}
                </Picker>
            </PickerWrapper>
          </InputGroup>
        </Section>

        {/* Status & Severity Section */}
        <Section icon="options-outline" title="Status & Severity">
            <InputGroup label="Status">
                <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>
                    <Picker selectedValue={status} onValueChange={(itemValue: Incident['status']) => setStatus(itemValue)} style={[styles.picker, { color: textColor }]}>
                        <Picker.Item label="Open" value="open" />
                        <Picker.Item label="In Progress" value="in_progress" />
                        <Picker.Item label="Resolved" value="resolved" />
                        <Picker.Item label="Closed" value="closed" />
                    </Picker>
                </PickerWrapper>
            </InputGroup>
            <InputGroup label="Severity">
                <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>
                    <Picker selectedValue={severity} onValueChange={(itemValue: Incident['severity']) => setSeverity(itemValue)} style={[styles.picker, { color: textColor }]}>
                        <Picker.Item label="Critical" value="critical" />
                        <Picker.Item label="High" value="high" />
                        <Picker.Item label="Medium" value="medium" />
                        <Picker.Item label="Low" value="low" />
                        <Picker.Item label="Info" value="info" />
                    </Picker>
                </PickerWrapper>
            </InputGroup>
        </Section>

        {/* Actions Taken Section */}
        <Section icon="construct-outline" title="Actions Taken (Optional)">
            {actionsTaken.map((action, index) => (
                <ThemedView key={index} style={[styles.actionItemContainer, {borderColor}]}>
                    <ThemedText style={[styles.actionText, {color: textColor}]}>{action}</ThemedText>
                    <TouchableOpacity onPress={() => handleRemoveAction(index)}>
                        <Ionicons name="trash-bin-outline" size={20} color={useThemeColor({}, 'errorText')} />
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
                    <Ionicons name="add-outline" size={20} color={useThemeColor({}, 'primaryButtonText')} />
                </TouchableOpacity>
            </ThemedView>
        </Section>

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
    </ThemedView>
  );
}

// Helper components for styling consistency
const Section: React.FC<React.PropsWithChildren<{ icon: keyof typeof Ionicons.glyphMap; title: string }>> = ({ icon, title, children }) => {
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  return (
    <ThemedView style={styles.section}>
      <ThemedView style={styles.sectionHeader}>
        <Ionicons name={icon} size={20} color={tintColor} />
        <ThemedText style={[styles.sectionTitle, { color: textColor }]}>{title}</ThemedText>
      </ThemedView>
      {children}
    </ThemedView>
  );
};

const InputGroup: React.FC<React.PropsWithChildren<{ label: string }>> = ({ label, children }) => {
  const textColor = useThemeColor({}, 'text');
  return (
    <ThemedView style={styles.inputGroup}>
      <ThemedText style={[styles.inputLabel, { color: textColor }]}>{label}</ThemedText>
      {children}
    </ThemedView>
  );
};

const PickerWrapper: React.FC<React.PropsWithChildren<{borderColor: string, backgroundColor: string}>> = ({children, borderColor, backgroundColor}) => (
    <ThemedView style={[styles.pickerContainer, {borderColor, backgroundColor}]}>
        {children}
    </ThemedView>
);

// Styles (adapt from your add-room.tsx and refine)
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
    minHeight: 52, // For single line inputs
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md, // Added for better text centering
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  textArea: {
    minHeight: 100, // For multiline
    textAlignVertical: 'top', // Align text to top for multiline
  },
  pickerContainer: {
    height: 52,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center', // Center picker content vertically
    paddingHorizontal: Platform.OS === 'ios' ? Layout.spacing.lg : 0, // iOS needs padding here
  },
  picker: {
    height: '100%',
    width: '100%',
    // backgroundColor: 'transparent', // ensure picker itself is transparent
  },
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
});