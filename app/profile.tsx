// labwatch-app/app/profile.tsx
import Card from '@/components/Card';
import ListItem from '@/components/ListItem';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Stack } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet } from 'react-native';

// Dummy User Data
const dummyUser = {
  name: 'Dr. Alex Chen',
  email: 'alex.chen@labdomain.com',
  role: 'Senior Researcher',
  department: 'Molecular Biology',
  labAccess: ['Lab A', 'Lab B - Sector 1', 'Cold Room 2'],
  trainingsCompleted: [
    { id: 'train001', name: 'General Lab Safety', completedOn: '2023-01-15' },
    { id: 'train002', name: 'Chemical Handling & Waste Disposal', completedOn: '2023-02-20' },
    { id: 'train003', name: 'Fire Safety & Extinguisher Use', completedOn: '2023-03-10' },
  ],
  contact: {
    office: 'Wing C, Room 301',
    phone: 'x5234',
  },
  profilePictureUrl: 'https://via.placeholder.com/150/007AFF/FFFFFF?text=AC'
};

export default function ProfileScreen() {
  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const subtleTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const borderColor = useThemeColor({}, 'borderColor');

  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>
      <Stack.Screen options={{ title: 'My Profile' }} />
      <ThemedView style={styles.container}>
        <Card style={styles.profileHeaderCard}>
          <ThemedView style={styles.avatarContainer}>
            <Image source={{ uri: dummyUser.profilePictureUrl }} style={styles.avatar} />
          </ThemedView>
          <ThemedText style={[styles.name, { color: textColor }]}>{dummyUser.name}</ThemedText>
          <ThemedText style={[styles.role, { color: subtleTextColor }]}>{dummyUser.role} - {dummyUser.department}</ThemedText>
          <ThemedText style={[styles.email, { color: subtleTextColor }]}>{dummyUser.email}</ThemedText>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: borderColor }]}>Contact Information</ThemedText>
          <ListItem title="Office" subtitle={dummyUser.contact.office} showBorder={true} />
          <ListItem title="Extension" subtitle={dummyUser.contact.phone} showBorder={false} />
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: borderColor }]}>Lab Access Permissions</ThemedText>
          {dummyUser.labAccess.map((lab, index) => (
            <ListItem key={index} title={lab} showBorder={index < dummyUser.labAccess.length - 1} />
          ))}
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: borderColor }]}>Training Records</ThemedText>
          {dummyUser.trainingsCompleted.map((training, index) => (
            <ListItem
              key={training.id}
              title={training.name}
              subtitle={`Completed: ${training.completedOn}`}
              showBorder={index < dummyUser.trainingsCompleted.length - 1}
            />
          ))}
        </Card>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarContainer: {
    marginBottom: 12,
    backgroundColor: 'transparent', // Ensure inner ThemedView is transparent if Card provides BG
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  role: {
    fontSize: 16,
    marginTop: 2,
  },
  email: {
    fontSize: 14,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
  },
});