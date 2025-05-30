// app/(tabs)/more/report-issue.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';

interface IssueType {
  id: string;
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export default function ReportIssueScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackground = useThemeColor({}, 'cardBackground');

  const [selectedIssueType, setSelectedIssueType] = useState<string>('');
  const [issueTitle, setIssueTitle] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const issueTypes: IssueType[] = [
    {
      id: 'bug',
      title: 'Bug Report',
      description: 'Something is not working correctly',
      icon: 'bug-outline',
    },
    {
      id: 'feature',
      title: 'Feature Request',
      description: 'Suggest a new feature or improvement',
      icon: 'bulb-outline',
    },
    {
      id: 'sensor',
      title: 'Sensor Issue',
      description: 'Problems with sensor readings or connectivity',
      icon: 'radio-outline',
    },
    {
      id: 'performance',
      title: 'Performance',
      description: 'App is slow or unresponsive',
      icon: 'speedometer-outline',
    },
    {
      id: 'ui',
      title: 'User Interface',
      description: 'Design or usability issues',
      icon: 'phone-portrait-outline',
    },
    {
      id: 'other',
      title: 'Other',
      description: 'Something else not listed above',
      icon: 'help-circle-outline',
    },
  ];

  const handleSubmit = async () => {
    if (!selectedIssueType) {
      Alert.alert('Missing Information', 'Please select an issue type.');
      return;
    }

    if (!issueTitle.trim()) {
      Alert.alert('Missing Information', 'Please provide a title for your issue.');
      return;
    }

    if (!issueDescription.trim()) {
      Alert.alert('Missing Information', 'Please provide a description of your issue.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call to submit issue
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Issue Submitted',
        'Thank you for your feedback! We\'ll review your issue and get back to you soon.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setSelectedIssueType('');
              setIssueTitle('');
              setIssueDescription('');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Submission Failed', 'Unable to submit your issue. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = issueTypes.find(type => type.id === selectedIssueType);

  return (
    <>
      <Stack.Screen options={{ title: 'Report Issue' }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Header */}
        <Card style={styles.headerCard}>
          <ThemedView style={styles.headerContent}>
            <ThemedView style={[styles.headerIconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name="bug-outline" size={32} color={tintColor} />
            </ThemedView>
            <ThemedView style={styles.headerText}>
              <ThemedText style={[styles.headerTitle, { color: textColor }]}>
                Report an Issue
              </ThemedText>
              <ThemedText style={[styles.headerSubtitle, { color: subtitleColor }]}>
                Help us improve LabWatch by reporting bugs or suggesting features
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </Card>

        {/* Issue Type Selection */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            What type of issue are you reporting?
          </ThemedText>
          
          {issueTypes.map((type, index) => (
            <TouchableOpacity 
              key={type.id}
              style={[
                styles.issueTypeOption,
                selectedIssueType === type.id && { backgroundColor: tintColor + '10' },
                index < issueTypes.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }
              ]}
              onPress={() => setSelectedIssueType(type.id)}
            >
              <ThemedView style={[
                styles.issueTypeIconContainer, 
                { backgroundColor: (selectedIssueType === type.id ? tintColor : subtitleColor) + '15' }
              ]}>
                <Ionicons 
                  name={type.icon} 
                  size={20} 
                  color={selectedIssueType === type.id ? tintColor : subtitleColor} 
                />
              </ThemedView>
              <ThemedView style={styles.issueTypeContent}>
                <ThemedText style={[
                  styles.issueTypeTitle, 
                  { color: selectedIssueType === type.id ? tintColor : textColor }
                ]}>
                  {type.title}
                </ThemedText>
                <ThemedText style={[styles.issueTypeDescription, { color: subtitleColor }]}>
                  {type.description}
                </ThemedText>
              </ThemedView>
              <Ionicons 
                name={selectedIssueType === type.id ? "radio-button-on" : "radio-button-off"}
                size={20} 
                color={selectedIssueType === type.id ? tintColor : subtitleColor} 
              />
            </TouchableOpacity>
          ))}
        </Card>

        {/* Issue Details */}
        {selectedIssueType && (
          <>
            <Card style={styles.sectionCard}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Issue Title
              </ThemedText>
              <TextInput
                style={[
                  styles.titleInput,
                  { 
                    backgroundColor: cardBackground,
                    borderColor: borderColor,
                    color: textColor,
                  }
                ]}
                placeholder="Brief summary of the issue"
                placeholderTextColor={subtitleColor}
                value={issueTitle}
                onChangeText={setIssueTitle}
                maxLength={100}
              />
              <ThemedText style={[styles.characterCount, { color: subtitleColor }]}>
                {issueTitle.length}/100 characters
              </ThemedText>
            </Card>

            <Card style={styles.sectionCard}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                Description
              </ThemedText>
              <TextInput
                style={[
                  styles.descriptionInput,
                  { 
                    backgroundColor: cardBackground,
                    borderColor: borderColor,
                    color: textColor,
                  }
                ]}
                placeholder="Please provide detailed information about the issue..."
                placeholderTextColor={subtitleColor}
                value={issueDescription}
                onChangeText={setIssueDescription}
                multiline
                textAlignVertical="top"
                maxLength={1000}
              />
              <ThemedText style={[styles.characterCount, { color: subtitleColor }]}>
                {issueDescription.length}/1000 characters
              </ThemedText>
            </Card>

            {/* System Info */}
            <Card style={styles.sectionCard}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                System Information
              </ThemedText>
              <ThemedText style={[styles.systemInfo, { color: subtitleColor }]}>
                The following information will be included with your report to help us diagnose the issue:
                {'\n\n'}
                • App Version: 1.0.0{'\n'}
                • Platform: Mobile{'\n'}
                • Issue Type: {selectedType?.title}{'\n'}
                • Timestamp: {new Date().toLocaleString()}
              </ThemedText>
            </Card>

            {/* Submit Button */}
            <TouchableOpacity 
              style={[
                styles.submitButton, 
                { backgroundColor: tintColor },
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Ionicons name="hourglass-outline" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.submitButtonText}>
                    Submitting...
                  </ThemedText>
                </>
              ) : (
                <>
                  <Ionicons name="send-outline" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.submitButtonText}>
                    Submit Issue
                  </ThemedText>
                </>
              )}
            </TouchableOpacity>
          </>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: Layout.spacing.md,
    paddingBottom: Layout.spacing.xl,
  },
  headerCard: {
    marginBottom: Layout.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  headerText: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },
  headerSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.3,
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  issueTypeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.sm,
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  issueTypeIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  issueTypeContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  issueTypeTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  issueTypeDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  titleInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  descriptionInput: {
    borderWidth: 1,
    borderRadius: Layout.borderRadius.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    height: 120,
  },
  characterCount: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
    textAlign: 'right',
  },
  systemInfo: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginTop: Layout.spacing.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
});
