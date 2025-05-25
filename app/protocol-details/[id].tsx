import Card from '@/components/Card'; // Assuming alias @ is set up for root
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';

interface ProtocolStep {
  stepNumber: number;
  instruction: string;
  importantNote?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
}

interface ProtocolDetail {
  id: string;
  name: string;
  description: string;
  category: string; // e.g., Fire, Chemical, Medical
  iconName: keyof typeof Ionicons.glyphMap;
  responsiblePersonnel: string[];
  lastReviewed: string;
  steps: ProtocolStep[];
  additionalContacts?: { name: string; contact: string }[];
}

// Dummy Data for protocols
const dummyProtocolsData: { [key: string]: ProtocolDetail } = {
  'fire-safety': {
    id: 'fire-safety',
    name: 'Fire Safety Protocol',
    description: 'Standard procedure for responding to a fire alarm or discovering a fire within the laboratory premises.',
    category: 'Fire Emergency',
    iconName: 'flame-outline',
    responsiblePersonnel: ['Lab Safety Officer', 'Floor Wardens', 'All Lab Personnel'],
    lastReviewed: '2024-01-15',
    steps: [
      { stepNumber: 1, instruction: 'Activate the nearest fire alarm pull station.', iconName: 'alarm-outline' },
      { stepNumber: 2, instruction: 'Alert others in the immediate vicinity by shouting "FIRE!"', iconName: 'megaphone-outline' },
      { stepNumber: 3, instruction: 'If trained and the fire is small and contained, attempt to extinguish using the appropriate fire extinguisher (PASS method). Do not put yourself at risk.', importantNote: 'Assess the situation. If in doubt, evacuate.', iconName: 'bonfire-outline' },
      { stepNumber: 4, instruction: 'Evacuate the building using the nearest and safest exit route. Do not use elevators.', iconName: 'walk-outline' },
      { stepNumber: 5, instruction: 'Close doors behind you as you leave to confine the fire, if possible.', iconName: 'log-out-outline' },
      { stepNumber: 6, instruction: 'Proceed to the designated assembly point outside the building.', iconName: 'people-outline' },
      { stepNumber: 7, instruction: 'Report to your supervisor or the assembly point coordinator. Do not re-enter the building until cleared by emergency services.', iconName: 'shield-checkmark-outline' },
    ],
    additionalContacts: [
        { name: 'Emergency Services', contact: '911 (or local equivalent)'},
        { name: 'Campus Security', contact: 'ext. 5555'}
    ]
  },
  'chemical-spill': {
    id: 'chemical-spill',
    name: 'Chemical Spill Response Protocol',
    description: 'Procedure for managing and cleaning up chemical spills to ensure personnel safety and minimize environmental impact.',
    category: 'Chemical Safety',
    iconName: 'flask-outline',
    responsiblePersonnel: [' Spill Response Team', 'Lab Safety Officer', 'Individual discovering spill'],
    lastReviewed: '2024-02-20',
    steps: [
      { stepNumber: 1, instruction: 'Alert personnel in the immediate area. Evacuate non-essential personnel if necessary.', iconName: 'warning-outline' },
      { stepNumber: 2, instruction: 'If safe to do so, identify the spilled chemical. Consult the MSDS/SDS immediately.', iconName: 'document-text-outline' },
      { stepNumber: 3, instruction: 'Don appropriate Personal Protective Equipment (PPE) as indicated by the MSDS/SDS.', iconName: 'body-outline' },
      { stepNumber: 4, instruction: 'Contain the spill using materials from the spill kit (e.g., absorbent pads, booms). Work from the outside of the spill inwards.', iconName: 'color-fill-outline' },
      { stepNumber: 5, instruction: 'Neutralize the spill if applicable and as per MSDS/SDS instructions.', iconName: 'water-outline' },
      { stepNumber: 6, instruction: 'Collect contaminated materials in designated waste bags or containers.', iconName: 'trash-outline' },
      { stepNumber: 7, instruction: 'Decontaminate the area and any affected equipment.', iconName: 'sparkles-outline' },
      { stepNumber: 8, instruction: 'Report the spill to the Lab Safety Officer and complete an incident report form.', iconName: 'reader-outline' },
    ],
  },
  // Add more dummy protocols as needed
};


export default function ProtocolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const protocol = id ? dummyProtocolsData[id] : null;

  if (!protocol) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: "Protocol Not Found" }} />
        <Text style={styles.errorText}>Protocol not found or ID is missing.</Text>
      </View>
    );
  }

  const renderStepItem = ({ item }: { item: ProtocolStep }) => (
    <View style={styles.stepItemContainer}>
      <View style={styles.stepNumberContainer}>
        {item.iconName && <Ionicons name={item.iconName} size={22} color="#007AFF" style={styles.stepIcon} />}
        <Text style={styles.stepNumber}>{item.stepNumber}.</Text>
      </View>
      <View style={styles.stepTextContainer}>
        <Text style={styles.stepInstruction}>{item.instruction}</Text>
        {item.importantNote && (
          <Text style={styles.stepImportantNote}>
            <Ionicons name="alert-circle-outline" size={14} color="#D0021B" /> {item.importantNote}
          </Text>
        )}
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.scrollViewContainer}>
      <Stack.Screen options={{ title: protocol.name }} />
      <View style={styles.container}>

        <Card style={styles.headerCard}>
          <View style={styles.titleContainer}>
            <Ionicons name={protocol.iconName || 'document-outline'} size={30} color="#007AFF" style={styles.headerIcon} />
            <Text style={styles.mainTitle}>{protocol.name}</Text>
          </View>
          <Text style={styles.categoryText}>Category: {protocol.category}</Text>
          <Text style={styles.descriptionText}>{protocol.description}</Text>
          <Text style={styles.metaText}>Last Reviewed: {protocol.lastReviewed}</Text>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Procedure Steps</Text>
          <FlatList
            data={protocol.steps}
            renderItem={renderStepItem}
            keyExtractor={(item) => item.stepNumber.toString()}
            scrollEnabled={false} // Disable FlatList scrolling within ScrollView
          />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Responsible Personnel</Text>
          {protocol.responsiblePersonnel.map((person, index) => (
            <Text key={index} style={styles.bodyText}>- {person}</Text>
          ))}
        </Card>

        {protocol.additionalContacts && protocol.additionalContacts.length > 0 && (
            <Card>
                <Text style={styles.sectionTitle}>Additional Contacts</Text>
                {protocol.additionalContacts.map((contact, index) => (
                    <View key={index} style={styles.contactItem}>
                        <Ionicons name="call-outline" size={16} color="#555" style={styles.contactIcon}/>
                        <Text style={styles.bodyText}><Text style={{fontWeight: 'bold'}}>{contact.name}:</Text> {contact.contact}</Text>
                    </View>
                ))}
            </Card>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
    backgroundColor: '#f4f6f8',
  },
  container: {
    flex: 1,
    padding: 16,
  },
  headerCard: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  headerIcon: {
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#444',
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
    color: '#777',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#4A4A4A',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  stepItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 5,
  },
  stepNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8,
    minWidth: 50, // To align text better
  },
  stepIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  stepTextContainer: {
    flex: 1,
  },
  stepInstruction: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
  },
  stepImportantNote: {
    fontSize: 13,
    color: '#D0021B',
    fontStyle: 'italic',
    marginTop: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#333',
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  contactIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: 'red',
  },
});