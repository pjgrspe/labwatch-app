// app/(tabs)/more/help.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React, { useState } from 'react';
import { Linking, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface HelpSection {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  items: { title: string; description: string; action?: () => void }[];
}

export default function HelpScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');

  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const helpSections: HelpSection[] = [
    {
      title: 'Quick Start',
      icon: 'rocket-outline',
      items: [
        {
          title: 'Getting Started Guide',
          description: 'Learn the basics of LabWatch',
        },
        {
          title: 'Setting Up Alerts',
          description: 'Configure notifications and thresholds',
        },
        {
          title: 'Understanding Dashboard',
          description: 'Navigate your monitoring interface',
        },
      ],
    },
    {
      title: 'Safety & Protocols',
      icon: 'shield-checkmark-outline',
      items: [
        {
          title: 'Emergency Procedures',
          description: 'What to do during alerts and incidents',
        },
        {
          title: 'Sensor Calibration',
          description: 'Maintaining accurate readings',
        },
        {
          title: 'Incident Reporting',
          description: 'Documenting safety events',
        },
      ],
    },
    {
      title: 'Account & Settings',
      icon: 'person-circle-outline',
      items: [
        {
          title: 'Profile Management',
          description: 'Update your account information',
        },
        {
          title: 'Notification Settings',
          description: 'Customize alert preferences',
        },
        {
          title: 'Role Permissions',
          description: 'Understanding user access levels',
        },
      ],
    },
  ];

  const faqItems: FAQItem[] = [
    {
      question: 'How do I respond to a critical alert?',
      answer: 'When you receive a critical alert, immediately check the dashboard for details, follow your lab\'s emergency protocols, and document any actions taken in the incident report.',
      category: 'Safety',
    },
    {
      question: 'Why am I not receiving notifications?',
      answer: 'Check your notification settings in the More tab > Settings. Ensure push notifications are enabled and your device allows notifications from LabWatch.',
      category: 'Settings',
    },
    {
      question: 'How often are sensor readings updated?',
      answer: 'Sensor readings are updated in real-time, typically every 10-30 seconds depending on the sensor type and configuration.',
      category: 'Monitoring',
    },
    {
      question: 'Can I export historical data?',
      answer: 'Yes, go to More > Data Export to download sensor data and reports for specific date ranges.',
      category: 'Data',
    },
    {
      question: 'What should I do if a sensor shows offline?',
      answer: 'Check the System Health page for more details. Contact your system administrator if the sensor remains offline for extended periods.',
      category: 'Troubleshooting',
    },
  ];
  const contactOptions = [
    {
      title: 'Email Support',
      subtitle: 'labwatch-support@auf.edu.ph',
      icon: 'mail-outline' as keyof typeof Ionicons.glyphMap,
      action: () => Linking.openURL('mailto:labwatch-support@auf.edu.ph'),
    },
    {
      title: 'User Manual',
      subtitle: 'Download complete documentation',
      icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
      action: () => {}, // Would open PDF or external link
    },
    {
      title: 'Video Tutorials',
      subtitle: 'Watch step-by-step guides',
      icon: 'play-circle-outline' as keyof typeof Ionicons.glyphMap,
      action: () => {}, // Would open video platform
    },
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'Help & Support' }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Help Sections */}
        {helpSections.map((section, index) => (
          <Card key={index} style={styles.sectionCard}>
            <ThemedView style={styles.sectionHeader}>
              <ThemedView style={[styles.sectionIconContainer, { backgroundColor: tintColor + '15' }]}>
                <Ionicons name={section.icon} size={24} color={tintColor} />
              </ThemedView>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
                {section.title}
              </ThemedText>
            </ThemedView>
            
            {section.items.map((item, itemIndex) => (
              <TouchableOpacity 
                key={itemIndex}
                style={[
                  styles.helpItem,
                  itemIndex < section.items.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  }
                ]}
                onPress={item.action}
              >
                <ThemedView style={styles.helpItemContent}>
                  <ThemedText style={[styles.helpItemTitle, { color: textColor }]}>
                    {item.title}
                  </ThemedText>
                  <ThemedText style={[styles.helpItemDescription, { color: subtitleColor }]}>
                    {item.description}
                  </ThemedText>
                </ThemedView>
                <Ionicons name="chevron-forward-outline" size={20} color={subtitleColor} />
              </TouchableOpacity>
            ))}
          </Card>
        ))}

        {/* FAQ Section */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Frequently Asked Questions
          </ThemedText>
          
          {faqItems.map((faq, index) => (
            <ThemedView key={index} style={styles.faqContainer}>
              <TouchableOpacity 
                style={[
                  styles.faqQuestion,
                  index < faqItems.length - 1 && expandedFAQ !== index && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  }
                ]}
                onPress={() => toggleFAQ(index)}
              >
                <ThemedText style={[styles.faqQuestionText, { color: textColor }]}>
                  {faq.question}
                </ThemedText>
                <Ionicons 
                  name={expandedFAQ === index ? "chevron-up-outline" : "chevron-down-outline"}
                  size={20} 
                  color={subtitleColor} 
                />
              </TouchableOpacity>
              
              {expandedFAQ === index && (
                <ThemedView style={[
                  styles.faqAnswer,
                  index < faqItems.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: borderColor,
                  }
                ]}>
                  <ThemedText style={[styles.faqAnswerText, { color: subtitleColor }]}>
                    {faq.answer}
                  </ThemedText>
                </ThemedView>
              )}
            </ThemedView>
          ))}
        </Card>

        {/* Contact Support */}
        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Need More Help?
          </ThemedText>
          
          {contactOptions.map((option, index) => (
            <TouchableOpacity 
              key={index}
              style={[
                styles.contactOption,
                index < contactOptions.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: borderColor,
                }
              ]}
              onPress={option.action}
            >
              <ThemedView style={[styles.contactIconContainer, { backgroundColor: tintColor + '15' }]}>
                <Ionicons name={option.icon} size={20} color={tintColor} />
              </ThemedView>
              <ThemedView style={styles.contactContent}>
                <ThemedText style={[styles.contactTitle, { color: textColor }]}>
                  {option.title}
                </ThemedText>
                <ThemedText style={[styles.contactSubtitle, { color: subtitleColor }]}>
                  {option.subtitle}
                </ThemedText>
              </ThemedView>
              <Ionicons name="chevron-forward-outline" size={20} color={subtitleColor} />
            </TouchableOpacity>
          ))}
        </Card>
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
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  sectionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    flex: 1,
  },
  helpItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  helpItemContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  helpItemTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  helpItemDescription: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  faqContainer: {
    backgroundColor: 'transparent',
  },
  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  faqQuestionText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  faqAnswer: {
    paddingBottom: Layout.spacing.md,
    paddingRight: Layout.spacing.xl,
    backgroundColor: 'transparent',
  },
  faqAnswerText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  contactOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  contactIconContainer: {
    width: 36,
    height: 36,
    borderRadius: Layout.borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.sm,
  },
  contactContent: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  contactTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  contactSubtitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
});
