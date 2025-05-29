// labwatch-app/app/modals/edit-incident.tsx
import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Alert as AlertType } from '@/types/alerts';
import { Incident, UpdateIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { getAlertsForSelector, getIncidentById, getRoomsForSelector, updateIncident } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Platform,
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';

export default function EditIncidentModal() {
  const router = useRouter();
  const { incidentId: incidentIdParam } = useLocalSearchParams<{ incidentId: string }>();

  const [incident, setIncident] = useState<Incident | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Room ID cannot be changed once an incident is created for simplicity, but you can allow it
  // const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [alertId, setAlertId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Incident['status']>('open');
  const [severity, setSeverity] = useState<Incident['severity']>('low');
  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const [rooms, setRooms] = useState<Room[]>([]);
  const [alerts, setAlerts] = useState<AlertType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#F2F2F7', dark: '#2C2C2E' }, 'inputBackground');
  const textColor = useThemeColor({}, 'text');
  const placeholderTextColor = useThemeColor({ light: '#8E8E93', dark: '#8E8E93' }, 'icon');
  const borderColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');
  const tintColor = useThemeColor({}, 'tint');
  const surfaceColor = useThemeColor({ light: '#FFFFFF', dark: '#1C1C1E' }, 'cardBackground');

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
        // setRoomId(fetchedIncident.roomId); // Room is not editable here
        setAlertId(fetchedIncident.alertId || undefined);
        setStatus(fetchedIncident.status);
        setSeverity(fetchedIncident.severity);
        setActionsTaken(fetchedIncident.actionsTaken || []);
        setResolutionDetails(fetchedIncident.resolutionDetails || '');
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
        alertId: alertId || undefined,
        status,
        severity,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
        resolutionDetails: resolutionDetails.trim() || undefined,
        // reportedBy and reportedAt are not updated here
        // roomId is not updated here
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
                else router.replace(`/incident-details/${incident.id}` as any);
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
        <Section icon="information-circle-outline" title="Incident Details">
          <InputGroup label="Title">
            <TextInput
              style={[styles.input, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              value={title}
              onChangeText={setTitle}
              placeholderTextColor={placeholderTextColor}
            />
          </InputGroup>
          <InputGroup label="Description">
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
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
          <InputGroup label="Room (Cannot be changed)">
            <ThemedText style={[styles.infoText, {color: textColor}]}>{incident.roomName || incident.roomId}</ThemedText>
          </InputGroup>
          <InputGroup label="Related Alert (Optional)">
             <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>
                <Picker
                selectedValue={alertId}
                onValueChange={(itemValue) => setAlertId(itemValue || undefined)}
                style={[styles.picker, { color: textColor }]}
                dropdownIconColor={textColor}
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
                    <Picker selectedValue={status} onValueChange={(itemValue) => setStatus(itemValue)} style={[styles.picker, { color: textColor }]}>
                        <Picker.Item label="Open" value="open" />
                        <Picker.Item label="In Progress" value="in_progress" />
                        <Picker.Item label="Resolved" value="resolved" />
                        <Picker.Item label="Closed" value="closed" />
                    </Picker>
                </PickerWrapper>
            </InputGroup>
            <InputGroup label="Severity">
                <PickerWrapper borderColor={borderColor} backgroundColor={inputBackgroundColor}>
                    <Picker selectedValue={severity} onValueChange={(itemValue) => setSeverity(itemValue)} style={[styles.picker, { color: textColor }]}>
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
        <Section icon="construct-outline" title="Actions Taken">
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

        {/* Resolution Details Section */}
        <Section icon="checkmark-done-circle-outline" title="Resolution Details (Optional)">
          <InputGroup label="Resolution">
            <TextInput
              style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
              placeholder="Describe how the incident was resolved..."
              value={resolutionDetails}
              onChangeText={setResolutionDetails}
              placeholderTextColor={placeholderTextColor}
              multiline
              numberOfLines={3}
            />
          </InputGroup>
        </Section>


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
    </ThemedView>
  );
}


// Helper components (can be moved to a shared file if used elsewhere)
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


// Styles (same as AddIncidentModal, ensure they are consistent)
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
  pickerContainer: {
    height: 52,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    paddingHorizontal: Platform.OS === 'ios' ? Layout.spacing.lg : 0,
  },
  picker: {
    height: '100%',
    width: '100%',
  },
  infoText: { // For displaying non-editable info like Room Name
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.lg,
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