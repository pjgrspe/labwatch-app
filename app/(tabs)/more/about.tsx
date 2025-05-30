// app/(tabs)/more/about.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, Linking } from 'react-native';

export default function AboutScreen() {
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');

  const appInfo = {
    name: 'LabWatch',
    version: '1.0.0',
    buildNumber: '100',
    description: 'Advanced laboratory monitoring and safety management system',
    developer: 'AUF Research Team',
    website: 'https://auf.edu.ph',
    support: 'labwatch-support@auf.edu.ph',
  };

  const features = [
    'Real-time sensor monitoring',
    'Automated alert system',
    'Incident management',
    'Emergency protocols',
    'Multi-room support',
    'Role-based access control',
  ];

  const handleWebsitePress = () => {
    Linking.openURL(appInfo.website);
  };

  const handleSupportPress = () => {
    Linking.openURL(`mailto:${appInfo.support}`);
  };

  return (
    <>
      <Stack.Screen options={{ title: 'About LabWatch' }} />
      <ScrollView 
        style={[styles.container, { backgroundColor }]}
        contentContainerStyle={styles.contentContainer}
      >
        <Card style={styles.appInfoCard}>
          <ThemedView style={styles.appHeader}>
            <ThemedView style={[styles.appIconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name="flask" size={40} color={tintColor} />
            </ThemedView>
            <ThemedView style={styles.appTitleContainer}>
              <ThemedText style={[styles.appName, { color: textColor }]}>
                {appInfo.name}
              </ThemedText>
              <ThemedText style={[styles.appVersion, { color: subtitleColor }]}>
                Version {appInfo.version} (Build {appInfo.buildNumber})
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          <ThemedText style={[styles.appDescription, { color: subtitleColor }]}>
            {appInfo.description}
          </ThemedText>
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Key Features
          </ThemedText>
          {features.map((feature, index) => (
            <ThemedView key={index} style={styles.featureRow}>
              <Ionicons name="checkmark-circle" size={20} color={tintColor} />
              <ThemedText style={[styles.featureText, { color: textColor }]}>
                {feature}
              </ThemedText>
            </ThemedView>
          ))}
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Developer Information
          </ThemedText>
          
          <ThemedView style={styles.infoRow}>
            <Ionicons name="business" size={20} color={tintColor} />
            <ThemedText style={[styles.infoText, { color: textColor }]}>
              {appInfo.developer}
            </ThemedText>
          </ThemedView>

          <TouchableOpacity style={styles.infoRow} onPress={handleWebsitePress}>
            <Ionicons name="globe" size={20} color={tintColor} />
            <ThemedText style={[styles.linkText, { color: tintColor }]}>
              {appInfo.website}
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoRow} onPress={handleSupportPress}>
            <Ionicons name="mail" size={20} color={tintColor} />
            <ThemedText style={[styles.linkText, { color: tintColor }]}>
              {appInfo.support}
            </ThemedText>
          </TouchableOpacity>
        </Card>

        <Card style={styles.sectionCard}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Legal
          </ThemedText>
          
          <ThemedText style={[styles.legalText, { color: subtitleColor }]}>
            © 2025 Angeles University Foundation. All rights reserved.
            {'\n\n'}
            This application is designed for laboratory safety monitoring and management. 
            Use in accordance with your institution's safety protocols and guidelines.
          </ThemedText>
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
  appInfoCard: {
    marginBottom: Layout.spacing.lg,
  },
  appHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  appIconContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  appTitleContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  appName: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs / 2,
  },
  appVersion: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  appDescription: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.md * 1.4,
  },
  sectionCard: {
    marginBottom: Layout.spacing.lg,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  featureText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  infoText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.sm,
    flex: 1,
  },
  linkText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginLeft: Layout.spacing.sm,
    flex: 1,
    textDecorationLine: 'underline',
  },
  legalText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
});
