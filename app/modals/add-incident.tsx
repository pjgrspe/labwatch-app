import { ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { Incident, NewIncident } from '@/types/incidents';
import { Room } from '@/types/rooms';
import { addIncident, getRoomsForSelector } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator, Dimensions, FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    Alert as RNAlert,
    ScrollView,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import Markdown from 'react-native-markdown-display';

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

// AI suggestion generation function using Gemini 2.0-flash
const generateAISuggestion = async (incidentData: {
  title: string;
  description: string;
  severity: string;
  alertType?: string;
  sensorType?: string;
  triggeringValue?: string;
  roomName?: string;
}): Promise<string> => {
  try {
    const { GEMINI_API_KEY } = await import('@/APIkeys');
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured');
    }
    
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    
    // System instruction for incident response suggestions
    const systemInstruction = `You are a laboratory safety AI assistant specializing in incident response. Provide clear, actionable safety recommendations for laboratory incidents. Your responses must be:
- Focused on immediate safety actions
- Based on laboratory safety best practices
- Concise and actionable (under 300 words)
- Structured with clear immediate actions, safety precautions, and follow-up steps`;

    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash",
      systemInstruction 
    });

    const prompt = `Provide incident response suggestions for:

Incident: ${incidentData.title}
Description: ${incidentData.description}
Severity: ${incidentData.severity}
Location: ${incidentData.roomName || 'Unknown'}
${incidentData.alertType ? `Alert Type: ${incidentData.alertType}` : ''}
${incidentData.sensorType ? `Sensor Type: ${incidentData.sensorType}` : ''}
${incidentData.triggeringValue ? `Triggering Value: ${incidentData.triggeringValue}` : ''}

Please provide:
1. Immediate actions to take
2. Safety precautions
3. Follow-up recommendations`;

    console.log('Making request to Gemini 2.0-flash...');
    
    const result = await model.generateContent(prompt);
    const response = result.response;
    const suggestion = response.text();
    
    console.log('AI suggestion generated successfully');
    return suggestion;
    
  } catch (error: any) {
    console.error('Error generating AI suggestion:', error);
    
    // Enhanced error handling based on your assistant implementation
    if (error.message && error.message.includes('API key not valid')) {
      return 'AI API key is not valid. Please check your configuration.';
    }
    if (error.message && error.message.includes('FETCH_ERROR')) {
      return 'Network error: Unable to connect to AI service. Please check your internet connection.';
    }
    if (error.message && error.message.toLowerCase().includes('finishreason: 4')) {
      return 'Unable to generate suggestion due to safety guidelines. Please consult laboratory safety protocols.';
    }
    if (error.message && error.message.toLowerCase().includes('finishreason: 3')) {
      return 'Unable to generate suggestion due to content policies. Please consult laboratory safety protocols.';
    }
    
    return `Unable to generate AI suggestion: ${error.message || 'Unknown error'}. Please consult laboratory safety protocols and experienced personnel for guidance.`;
  }
};

export default function AddIncidentModal() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    alertId?: string;
    alertType?: string;
    alertMessage?: string;
    alertSeverity?: string;
    roomId?: string;
    roomName?: string;
    triggeringValue?: string;
    sensorType?: string;
    timestamp?: string;
  }>();

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [roomId, setRoomId] = useState<string | undefined>(undefined);
  const [roomName, setRoomName] = useState<string | undefined>(undefined);
  const [alertId, setAlertId] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState<Incident['status']>('open');
  const [severity, setSeverity] = useState<Incident['severity']>('medium');  const [actionsTaken, setActionsTaken] = useState<string[]>([]);
  const [currentAction, setCurrentAction] = useState('');
  const [resolutionDetails, setResolutionDetails] = useState('');
  const [aiSuggestion, setAiSuggestion] = useState('');
  const [isEditingAI, setIsEditingAI] = useState(false);

  // Selected display objects
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [selectedSeverity, setSelectedSeverity] = useState<typeof SEVERITY_OPTIONS[0] | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<typeof STATUS_OPTIONS[0] | null>(null);

  // Modal visibility states
  const [showRoomDropdown, setShowRoomDropdown] = useState(false);
  const [showSeverityDropdown, setShowSeverityDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  // Loading states
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);

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
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');  const dropdownModalBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'cardBackground');
  const separatorColor = useThemeColor({ light: '#E5E5EA', dark: '#38383A' }, 'borderColor');

  // Markdown styles for AI suggestion display
  const markdownStyles = StyleSheet.create({
    body: {
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Regular',
      color: textColor,
      lineHeight: Layout.fontSize.md * 1.5,
    },
    heading1: {
      fontSize: Layout.fontSize.lg,
      fontFamily: 'Montserrat-Bold',
      color: textColor,
      marginTop: Layout.spacing.sm,
      marginBottom: Layout.spacing.xs,
      fontWeight: Layout.fontWeight.bold,
    },
    heading2: {
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-SemiBold',
      color: textColor,
      marginTop: Layout.spacing.sm,
      marginBottom: Layout.spacing.xs,
      fontWeight: Layout.fontWeight.semibold,
    },
    bullet_list_icon: {
      color: tintColor,
      fontSize: Layout.fontSize.sm,
    },
    ordered_list_icon: {
      color: tintColor,
      fontSize: Layout.fontSize.sm,
    },
    list_item: {
      marginVertical: Layout.spacing.xs / 2,
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Regular',
    },
    strong: {
      fontFamily: 'Montserrat-Bold',
      fontWeight: Layout.fontWeight.bold,
      color: textColor,
    },
    em: {
      fontFamily: 'Montserrat-Regular',
      fontStyle: 'italic',
      color: textColor,
    },
    paragraph: {
      marginBottom: Layout.spacing.sm,
      fontSize: Layout.fontSize.md,
      fontFamily: 'Montserrat-Regular',
      color: textColor,
    },
    code_inline: {
      backgroundColor: inputBackgroundColor,
      color: textColor,
      paddingHorizontal: Layout.spacing.xs,
      paddingVertical: 2,
      borderRadius: Layout.borderRadius.sm,
      fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
      fontSize: Layout.fontSize.sm,
    },
  });

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
  };  // Initialize data and prepopulate from alert parameters
  const initializeData = useCallback(async () => {
    setIsDataLoading(true);
    try {
      const fetchedRooms = await getRoomsForSelector();
      setRooms(fetchedRooms);

      // If alert parameters are provided, prepopulate the form
      if (params.alertId) {
        setAlertId(params.alertId);
        
        // Set room information
        if (params.roomId) {
          setRoomId(params.roomId);
          setRoomName(params.roomName);
          const room = fetchedRooms.find(r => r.id === params.roomId);
          if (room) {
            setSelectedRoom(room);
          }
        }        // Generate title and description based on alert data
        const alertTitle = params.alertType 
          ? `Alert: ${params.alertType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`
          : 'Alert: Unknown Type';
        const alertDescription = `${params.alertMessage || 'Alert condition detected'}${params.triggeringValue ? ` (Value: ${params.triggeringValue})` : ''}${params.sensorType ? ` - Sensor: ${params.sensorType}` : ''}`;
        
        setTitle(alertTitle);
        setDescription(alertDescription);

        // Set severity based on alert severity
        if (params.alertSeverity) {
          const mappedSeverity = mapAlertSeverityToIncidentSeverity(params.alertSeverity);
          setSeverity(mappedSeverity);
          const severityOption = SEVERITY_OPTIONS.find(s => s.id === mappedSeverity);
          setSelectedSeverity(severityOption || null);
        }
      }

      // Set default status
      setSelectedStatus(STATUS_OPTIONS.find(s => s.id === 'open') || null);
      
    } catch (error) {
      console.error("Error initializing data:", error);
      RNAlert.alert("Error", "Could not load data. Please try again.");
    } finally {
      setIsDataLoading(false);
    }
  }, []); // Remove params dependency to prevent infinite loop

  // Map alert severity to incident severity
  const mapAlertSeverityToIncidentSeverity = (alertSeverity: string): Incident['severity'] => {
    switch (alertSeverity) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      case 'low': return 'low';
      case 'info': return 'info';
      default: return 'medium';
    }
  };

  useEffect(() => {
    initializeData();
  }, [initializeData]);
  const handleAddAction = () => {
    if (currentAction.trim()) {
      setActionsTaken([...actionsTaken, currentAction.trim()]);
      setCurrentAction('');
    }
  };

  const handleRemoveAction = (index: number) => {
    setActionsTaken(actionsTaken.filter((_, i) => i !== index));
  };
  const handleGenerateAISuggestion = async () => {
    if (!title.trim() || !description.trim()) {
      RNAlert.alert("Missing Information", "Please fill out title and description first to generate AI suggestions.");
      return;
    }

    setIsGeneratingAI(true);
    try {
      const suggestion = await generateAISuggestion({
        title,
        description,
        severity,
        alertType: params.alertType,
        sensorType: params.sensorType,
        triggeringValue: params.triggeringValue,
        roomName: roomName || params.roomName
      });
      setAiSuggestion(suggestion);
      
      // Check if the suggestion contains an error message
      if (suggestion.includes('AI service error:') || 
          suggestion.includes('Network error:') || 
          suggestion.includes('not properly configured')) {
        RNAlert.alert("AI Service Issue", suggestion);
      }
    } catch (error) {
      console.error("Error generating AI suggestion:", error);
      
      let errorMessage = "Failed to generate AI suggestion. Please try again.";
      if (error instanceof Error && error.message) {
        errorMessage = `AI Error: ${error.message}`;
      }
      
      RNAlert.alert("Error", errorMessage);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleCreateIncident = async () => {
    if (!auth.currentUser) {
      RNAlert.alert("Error", "You must be logged in to create an incident.");
      return;
    }

    if (!title.trim() || !description.trim()) {
      RNAlert.alert("Missing Information", "Please fill out title and description.");
      return;
    }

    if (!roomId || !selectedRoom) {
      RNAlert.alert("Missing Information", "Please select a room for this incident.");
      return;
    }

    setIsLoading(true);
    try {
      const newIncident: NewIncident = {
        title: title.trim(),
        description: description.trim(),
        roomId,
        roomName: selectedRoom.name,
        alertId: alertId || undefined,
        status,
        severity,
        actionsTaken: actionsTaken.length > 0 ? actionsTaken : undefined,
        resolutionDetails: resolutionDetails.trim() || undefined,
        aiSuggestion: aiSuggestion.trim() || undefined,
        reportedBy: auth.currentUser.uid,
        reportedAt: new Date(),
      };

      const incidentId = await addIncident(newIncident);
      RNAlert.alert(
        "Incident Created",
        `Incident "${title}" has been successfully created.`,
        [{
          text: "OK",
          onPress: () => {
            setIsLoading(false);
            router.back();
          }
        }]
      );
    } catch (error) {
      console.error("Error creating incident:", error);
      RNAlert.alert("Error", "Failed to create incident. Please try again.");
      setIsLoading(false);
    }
  };
  if (isDataLoading) {
    return (
        <ThemedView style={[styles.container, {justifyContent: 'center', alignItems: 'center', backgroundColor}]}>
            <ActivityIndicator size="large" color={tintColor} />
            <ThemedText style={{marginTop: Layout.spacing.md, color: textColor}}>Loading...</ThemedText>
        </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <Stack.Screen options={{ title: 'Create Incident' }} />
      <KeyboardAvoidingView 
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
      >
        <ScrollView
          style={styles.content}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Alert Info Section (if from alert) */}
          {params.alertId && (
            <ThemedView style={[styles.section]}>
              <ThemedView style={styles.sectionHeader}>
                <Ionicons name="notifications-outline" size={20} color={tintColor} />
                <ThemedText style={[styles.sectionTitle, { color: textColor }]}>From Alert</ThemedText>
              </ThemedView>
                <ThemedView style={[styles.alertInfoBox, { backgroundColor: `${tintColor}10`, borderColor: tintColor }]}>
                <ThemedText style={[styles.alertInfoText, { color: textColor }]}>
                  This incident is being created from alert: {params.alertType ? params.alertType.replace(/_/g, ' ') : 'Unknown Alert'}
                </ThemedText>
                {params.timestamp && (
                  <ThemedText style={[styles.alertInfoTime, { color: textSecondaryColor }]}>
                    {new Date(params.timestamp).toLocaleString()}
                  </ThemedText>
                )}
              </ThemedView>
            </ThemedView>
          )}

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
                placeholder="Enter incident title"
                placeholderTextColor={placeholderTextColor}
              />
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: textColor }]}>Description</ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the incident in detail"
                placeholderTextColor={placeholderTextColor}
                multiline
                numberOfLines={4}
              />
            </ThemedView>
          </ThemedView>

          {/* Location Section */}
          <ThemedView style={[styles.section]}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons name="location-outline" size={20} color={tintColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Location</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedText style={[styles.inputLabel, { color: textColor }]}>Room</ThemedText>
              <TouchableOpacity
                style={[styles.dropdown, { 
                  backgroundColor: inputBackgroundColor, 
                  borderColor: borderColor 
                }]}
                onPress={() => setShowRoomDropdown(true)}
              >                {selectedRoom ? (
                  <ThemedView style={styles.selectedModuleContent}>
                    <ThemedText style={[styles.selectedModuleText, { color: textColor }]}>
                      {selectedRoom.name}
                    </ThemedText>
                    <ThemedText style={[styles.selectedModuleType, { color: textSecondaryColor }]}>
                      {selectedRoom.building && selectedRoom.floor 
                        ? `${selectedRoom.building} - ${selectedRoom.floor}`
                        : selectedRoom.building || selectedRoom.floor || 'Location not specified'
                      }
                    </ThemedText>
                  </ThemedView>
                ) : (
                  <ThemedText style={[styles.dropdownPlaceholder, { color: placeholderTextColor }]}>
                    Select Room
                  </ThemedText>
                )}
                <Ionicons name="chevron-down" size={20} color={textSecondaryColor} />
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>          {/* Status & Severity Section */}
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
          </ThemedView>          {/* AI Suggestion Section */}
          <ThemedView style={[styles.section]}>
            <ThemedView style={styles.sectionHeader}>
              <Ionicons name="bulb-outline" size={20} color={tintColor} />
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>AI Suggestion</ThemedText>
              <TouchableOpacity
                style={[styles.generateButton, { backgroundColor: tintColor }]}
                onPress={handleGenerateAISuggestion}
                disabled={isGeneratingAI || !title.trim() || !description.trim()}
                activeOpacity={0.7}
              >
                {isGeneratingAI ? (
                  <ActivityIndicator size="small" color={primaryButtonTextColor} />
                ) : (
                  <Ionicons name="sparkles" size={16} color={primaryButtonTextColor} />
                )}
                <ThemedText style={[styles.generateButtonText, { color: primaryButtonTextColor }]}>
                  {isGeneratingAI ? 'Generating...' : 'Generate'}
                </ThemedText>
              </TouchableOpacity>
            </ThemedView>
            
            <ThemedView style={styles.inputGroup}>
              <ThemedView style={styles.aiSuggestionHeader}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>AI Response Suggestion</ThemedText>
                {aiSuggestion.trim() && (
                  <TouchableOpacity
                    style={[styles.editToggleButton, { backgroundColor: isEditingAI ? warningTextColor : tintColor }]}
                    onPress={() => setIsEditingAI(!isEditingAI)}
                    activeOpacity={0.7}
                  >
                    <Ionicons 
                      name={isEditingAI ? "checkmark" : "create-outline"} 
                      size={14} 
                      color={primaryButtonTextColor} 
                    />
                    <ThemedText style={[styles.editToggleText, { color: primaryButtonTextColor }]}>
                      {isEditingAI ? 'Done' : 'Edit'}
                    </ThemedText>
                  </TouchableOpacity>
                )}
              </ThemedView>
              
              {!aiSuggestion.trim() ? (
                <ThemedView style={[styles.aiPlaceholder, { backgroundColor: inputBackgroundColor, borderColor }]}>
                  <Ionicons name="bulb-outline" size={24} color={placeholderTextColor} />
                  <ThemedText style={[styles.aiPlaceholderText, { color: placeholderTextColor }]}>
                    AI-generated suggestions will appear here. Fill out the title and description, then click Generate.
                  </ThemedText>
                </ThemedView>
              ) : isEditingAI ? (
                <TextInput
                  style={[styles.input, styles.textArea, { backgroundColor: inputBackgroundColor, color: textColor, borderColor }]}
                  value={aiSuggestion}
                  onChangeText={setAiSuggestion}
                  placeholder="AI-generated suggestions will appear here. You can edit them as needed."
                  placeholderTextColor={placeholderTextColor}
                  multiline
                  numberOfLines={6}
                />
              ) : (
                <ThemedView style={[styles.aiSuggestionDisplay, { backgroundColor: inputBackgroundColor, borderColor }]}>
                  <Markdown style={markdownStyles}>
                    {aiSuggestion}
                  </Markdown>
                </ThemedView>
              )}
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
                Creating Incident...
              </ThemedText>
            </ThemedView>
          ) : (
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: tintColor }]}
              onPress={handleCreateIncident}
            >
              <ThemedText style={styles.primaryButtonText}>Create Incident</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
      </KeyboardAvoidingView>      {/* Room Selection Modal */}
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
            
            {rooms.length === 0 ? (
              <ThemedView style={styles.emptyListContainer}>
                <Ionicons name="business-outline" size={40} color={textSecondaryColor} />
                <ThemedText style={[styles.emptyListText, { color: textColor }]}>
                  No rooms available
                </ThemedText>
              </ThemedView>
            ) : (
              <FlatList
                data={rooms}
                keyExtractor={(item) => item.id}
                style={styles.dropdownList}
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.moduleItem, { borderBottomColor: separatorColor }]}
                    onPress={() => {
                      setSelectedRoom(item);
                      setRoomId(item.id);
                      setRoomName(item.name);
                      setShowRoomDropdown(false);
                    }}
                  >
                    <ThemedView style={styles.moduleItemContent}>
                      <Ionicons 
                        name="business-outline" 
                        size={24} 
                        color={tintColor} 
                        style={styles.moduleItemIcon} 
                      />
                      <ThemedView style={styles.moduleItemTextContainer}>
                        <ThemedText style={[styles.moduleItemName, { color: textColor }]}>
                          {item.name}
                        </ThemedText>                        <ThemedText style={[styles.moduleItemType, { color: textSecondaryColor }]}>
                          {item.building && item.floor 
                            ? `${item.building} - ${item.floor}`
                            : item.building || item.floor || 'Location not specified'
                          }
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
  keyboardAvoidingView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.lg,
    gap: Layout.spacing.xl,
    paddingBottom: Layout.spacing.xl, // Extra padding at bottom for keyboard
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
  },  // Primary Button
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
  
  // Alert Info Box
  alertInfoBox: {
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    marginBottom: Layout.spacing.md,
  },
  alertInfoText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs,
  },
  alertInfoTime: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
    // Generate Button
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    marginLeft: 'auto',
    gap: Layout.spacing.xs,
  },generateButtonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  
  // AI Suggestion styles
  aiSuggestionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  editToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Layout.spacing.xs,
  },
  editToggleText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
  },
  aiPlaceholder: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Layout.spacing.sm,
  },
  aiPlaceholderText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: Layout.fontSize.md * 1.4,
  },
  aiSuggestionDisplay: {
    minHeight: 120,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.lg,
    paddingVertical: Layout.spacing.md,
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