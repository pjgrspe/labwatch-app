// labwatch-app/app/protocol-details/[id].tsx
import Card from '@/components/Card';
import { Text as ThemedText, View as ThemedView } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { FlatList, ScrollView, StyleSheet } from 'react-native';

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
  category: string;
  iconName: keyof typeof Ionicons.glyphMap;
  responsiblePersonnel: string[];
  lastReviewed: string;
  steps: ProtocolStep[];
  additionalContacts?: { name: string; contact: string }[];
}

const dummyProtocolsData: { [key: string]: ProtocolDetail } = {
  'fire-safety': { id: 'fire-safety', name: 'Fire Safety Protocol', description: 'Standard procedure for responding to a fire alarm or discovering a fire within the laboratory premises.', category: 'Fire Emergency', iconName: 'flame-outline', responsiblePersonnel: ['Lab Safety Officer', 'Floor Wardens', 'All Lab Personnel'], lastReviewed: '2024-01-15', steps: [ { stepNumber: 1, instruction: 'Activate the nearest fire alarm pull station.', iconName: 'alarm-outline' }, { stepNumber: 2, instruction: 'Alert others in the immediate vicinity by shouting "FIRE!"', iconName: 'megaphone-outline' }, { stepNumber: 3, instruction: 'If trained and the fire is small and contained, attempt to extinguish using the appropriate fire extinguisher (PASS method). Do not put yourself at risk.', importantNote: 'Assess the situation. If in doubt, evacuate.', iconName: 'bonfire-outline' }, { stepNumber: 4, instruction: 'Evacuate the building using the nearest and safest exit route. Do not use elevators.', iconName: 'walk-outline' }, { stepNumber: 5, instruction: 'Close doors behind you as you leave to confine the fire, if possible.', iconName: 'log-out-outline' }, { stepNumber: 6, instruction: 'Proceed to the designated assembly point outside the building.', iconName: 'people-outline' }, { stepNumber: 7, instruction: 'Report to your supervisor or the assembly point coordinator. Do not re-enter the building until cleared by emergency services.', iconName: 'shield-checkmark-outline' }, ], additionalContacts: [ { name: 'Emergency Services', contact: '911 (or local equivalent)'}, { name: 'Campus Security', contact: 'ext. 5555'} ] },
  'chemical-spill': { id: 'chemical-spill', name: 'Chemical Spill Response Protocol', description: 'Procedure for managing and cleaning up chemical spills to ensure personnel safety and minimize environmental impact.', category: 'Chemical Safety', iconName: 'flask-outline', responsiblePersonnel: [' Spill Response Team', 'Lab Safety Officer', 'Individual discovering spill'], lastReviewed: '2024-02-20', steps: [ { stepNumber: 1, instruction: 'Alert personnel in the immediate area. Evacuate non-essential personnel if necessary.', iconName: 'warning-outline' }, { stepNumber: 2, instruction: 'If safe to do so, identify the spilled chemical. Consult the MSDS/SDS immediately.', iconName: 'document-text-outline' }, { stepNumber: 3, instruction: 'Don appropriate Personal Protective Equipment (PPE) as indicated by the MSDS/SDS.', iconName: 'body-outline' }, { stepNumber: 4, instruction: 'Contain the spill using materials from the spill kit (e.g., absorbent pads, booms). Work from the outside of the spill inwards.', iconName: 'color-fill-outline' }, { stepNumber: 5, instruction: 'Neutralize the spill if applicable and as per MSDS/SDS instructions.', iconName: 'water-outline' }, { stepNumber: 6, instruction: 'Collect contaminated materials in designated waste bags or containers.', iconName: 'trash-outline' }, { stepNumber: 7, instruction: 'Decontaminate the area and any affected equipment.', iconName: 'sparkles-outline' }, { stepNumber: 8, instruction: 'Report the spill to the Lab Safety Officer and complete an incident report form.', iconName: 'reader-outline' }, ], },
};


export default function ProtocolDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const protocol = id ? dummyProtocolsData[id] : null;

  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const iconColor = useThemeColor({}, 'tint'); // Default tint for icons
  const importantNoteColor = useThemeColor({}, 'errorText');
  const errorTextColor = useThemeColor({}, 'errorText');

  if (!protocol) {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ title: "Protocol Not Found" }} />
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>Protocol not found or ID is missing.</ThemedText>
      </ThemedView>
    );
  }

  const renderStepItem = ({ item }: { item: ProtocolStep }) => (
    <ThemedView style={styles.stepItemContainer}>
      <ThemedView style={styles.stepNumberContainer}>
        {item.iconName && <Ionicons name={item.iconName} size={22} color={iconColor} style={styles.stepIcon} />}
        <ThemedText style={[styles.stepNumber, { color: iconColor }]}>{item.stepNumber}.</ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepTextContainer}>
        <ThemedText style={[styles.stepInstruction, { color: textColor }]}>{item.instruction}</ThemedText>
        {item.importantNote && (
          <ThemedText style={[styles.stepImportantNote, { color: importantNoteColor }]}>
            <Ionicons name="alert-circle-outline" size={14} color={importantNoteColor} /> {item.importantNote}
          </ThemedText>
        )}
      </ThemedView>
    </ThemedView>
  );

  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>
      <Stack.Screen options={{ title: protocol.name }} />
      <ThemedView style={styles.container}>

        <Card style={styles.headerCard}>
          <ThemedView style={styles.titleContainer}>
            <Ionicons name={protocol.iconName || 'document-outline'} size={30} color={iconColor} style={styles.headerIcon} />
            <ThemedText style={[styles.mainTitle, { color: textColor }]}>{protocol.name}</ThemedText>
          </ThemedView>
          <ThemedText style={[styles.categoryText, { color: metaTextColor }]}>Category: {protocol.category}</ThemedText>
          <ThemedText style={[styles.descriptionText, { color: textColor }]}>{protocol.description}</ThemedText>
          <ThemedText style={[styles.metaText, { color: metaTextColor }]}>Last Reviewed: {protocol.lastReviewed}</ThemedText>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Procedure Steps</ThemedText>
          <FlatList
            data={protocol.steps}
            renderItem={renderStepItem}
            keyExtractor={(item) => item.stepNumber.toString()}
            scrollEnabled={false} 
          />
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Responsible Personnel</ThemedText>
          {protocol.responsiblePersonnel.map((person, index) => (
            <ThemedText key={index} style={[styles.bodyText, { color: textColor }]}>- {person}</ThemedText>
          ))}
        </Card>

        {protocol.additionalContacts && protocol.additionalContacts.length > 0 && (
            <Card>
                <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Additional Contacts</ThemedText>
                {protocol.additionalContacts.map((contact, index) => (
                    <ThemedView key={index} style={styles.contactItem}>
                        <Ionicons name="call-outline" size={16} color={metaTextColor} style={styles.contactIcon}/>
                        <ThemedText style={[styles.bodyText, { color: textColor }]}><ThemedText style={{fontWeight: 'bold', color: textColor}}>{contact.name}:</ThemedText> {contact.contact}</ThemedText>
                    </ThemedView>
                ))}
            </Card>
        )}
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
  headerCard: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    backgroundColor: 'transparent',
  },
  headerIcon: {
    marginRight: 10,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flexShrink: 1,
  },
  categoryText: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
  },
  stepItemContainer: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingVertical: 5,
    backgroundColor: 'transparent',
  },
  stepNumberContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginRight: 8,
    minWidth: 50, 
    backgroundColor: 'transparent',
  },
  stepIcon: {
    marginRight: 6,
    marginTop: 1,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  stepTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  stepInstruction: {
    fontSize: 15,
    lineHeight: 22,
  },
  stepImportantNote: {
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 4,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  contactIcon: {
    marginRight: 8,
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
  },
});