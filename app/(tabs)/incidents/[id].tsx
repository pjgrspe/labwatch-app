// labwatch-app/app/incident-details/[id].tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { ColorName, Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Incident } from '@/types/incidents';
import { deleteIncident, getIncidentById } from '@/utils/firebaseUtils'; // Or your IncidentService
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

// Define severity colors based on your Colors.ts structure
const getSeverityColorName = (severity: Incident['severity']): ColorName => {
  switch (severity) {
    case 'critical':
    case 'high':
      return 'errorText';
    case 'medium':
      return 'warningText';
    case 'low':
      return 'successText';
    case 'info':
      return 'infoText';
    default:
      return 'text';
  }
};


export default function IncidentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const scrollViewBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const metaTextColor = useThemeColor({}, 'icon');
  const sectionTitleColor = useThemeColor({}, 'text');
  const cardBorderColor = useThemeColor({}, 'borderColor');
  const actionIconColor = useThemeColor({}, 'successText');
  const errorTextColor = useThemeColor({}, 'errorText');
  const tintColor = useThemeColor({}, 'tint');

  const fetchIncidentDetails = useCallback(async () => {
    if (!id) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const fetchedIncident = await getIncidentById(id);
      setIncident(fetchedIncident);
    } catch (error) {
      console.error("Failed to fetch incident details:", error);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchIncidentDetails();
  }, [fetchIncidentDetails]);

  const handleDeleteIncident = () => {
    if (!incident) return;
    Alert.alert(
      "Delete Incident",
      `Are you sure you want to delete incident "${incident.title}"? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteIncident(incident.id);
              Alert.alert("Success", "Incident deleted successfully.");
              router.back(); // Or navigate to incident list
            } catch (error) {
              Alert.alert("Error", "Failed to delete incident. Please try again.");
              console.error("Error deleting incident:", error);
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };


  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: scrollViewBackgroundColor}]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  if (!incident) {
    return (
      <ThemedView style={[styles.container, { backgroundColor: scrollViewBackgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <Stack.Screen options={{ title: "Incident Not Found" }} />
        <Ionicons name="alert-circle-outline" size={64} color={errorTextColor} />
        <ThemedText style={[styles.errorText, { color: errorTextColor }]}>Incident not found or ID is missing.</ThemedText>
      </ThemedView>
    );
  }

  const incidentSeverityColorName = getSeverityColorName(incident.severity);
  const incidentSeverityColor = useThemeColor({}, incidentSeverityColorName);

  return (
    <ScrollView style={[styles.scrollViewContainer, { backgroundColor: scrollViewBackgroundColor }]}>      <Stack.Screen
        options={{
          title: `Incident: ${incident.title.substring(0,20)}${incident.title.length > 20 ? '...' : ''}`,
          headerRight: () => (
            <ThemedView style={styles.headerButtons}>
              <Link href={{ pathname: "/modals/edit-incident", params: { incidentId: incident.id } }} asChild>
                <TouchableOpacity style={{ marginRight: Layout.spacing.lg }}>
                  <Ionicons name="pencil-outline" size={24} color={tintColor} />
                </TouchableOpacity>
              </Link>
              <TouchableOpacity onPress={handleDeleteIncident}>
                <Ionicons name="trash-outline" size={24} color={errorTextColor} />
              </TouchableOpacity>
            </ThemedView>
          ),
        }}
      />
      <ThemedView style={styles.container}>
        <Card style={styles.headerCard}>
          <ThemedText style={[styles.mainTitle, { color: textColor }]}>{incident.title}</ThemedText>
          <ThemedView style={styles.metaInfoContainer}>
            <MetaItem icon="calendar-outline" text={`Reported: ${incident.reportedAt ? new Date(incident.reportedAt).toLocaleString() : 'N/A'}`} color={metaTextColor} />
            {incident.updatedAt && incident.updatedAt.toString() !== incident.reportedAt.toString() && (
              <MetaItem icon="refresh-circle-outline" text={`Updated: ${new Date(incident.updatedAt).toLocaleString()}`} color={metaTextColor} />
            )}
            <MetaItem icon="person-outline" text={`Reported by: ${incident.reportedBy}`} color={metaTextColor} />
            <MetaItem icon="cube-outline" text={`Room: ${incident.roomName || incident.roomId}`} color={metaTextColor} />
            {incident.alertId && <MetaItem icon="notifications-outline" text={`Related Alert: ${incident.alertId}`} color={metaTextColor} />}
          </ThemedView>
           <ThemedView style={[styles.statusBadge, { backgroundColor: incidentSeverityColor }]}>
            <ThemedText style={styles.statusBadgeText}>{incident.severity} - {incident.status}</ThemedText>
          </ThemedView>
        </Card>

        <Card>
          <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Description</ThemedText>
          <ThemedText style={[styles.bodyText, { color: textColor }]}>{incident.description}</ThemedText>
        </Card>

        {incident.actionsTaken && incident.actionsTaken.length > 0 && (
            <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Actions Taken</ThemedText>
            {incident.actionsTaken.map((action, index) => (
                <ThemedView key={index} style={styles.actionItem}>
                <Ionicons name="checkmark-circle-outline" size={18} color={actionIconColor} style={styles.actionIcon} />
                <ThemedText style={[styles.bodyText, { color: textColor, flex: 1 }]}>{action}</ThemedText>
                </ThemedView>
            ))}
            </Card>
        )}        {incident.resolutionDetails && (
          <Card>
            <ThemedText style={[styles.sectionTitle, { color: sectionTitleColor, borderBottomColor: cardBorderColor }]}>Resolution Details</ThemedText>
            <ThemedText style={[styles.bodyText, { color: textColor }]}>{incident.resolutionDetails}</ThemedText>
          </Card>
        )}

      </ThemedView>
    </ScrollView>
  );
}

const MetaItem = ({icon, text, color}: {icon: keyof typeof Ionicons.glyphMap, text: string, color: string}) => (
  <ThemedView style={styles.metaItem}>
    <Ionicons name={icon} size={16} color={color} />
    <ThemedText style={[styles.metaText, { color: color }]}>{text}</ThemedText>
  </ThemedView>
);

const styles = StyleSheet.create({
  scrollViewContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: Layout.spacing.md,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  headerCard: {
    marginBottom: Layout.spacing.lg,
  },
  mainTitle: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    fontWeight: 'bold',
    marginBottom: Layout.spacing.sm,
  },
  metaInfoContainer: {
    marginBottom: Layout.spacing.md,
    backgroundColor: 'transparent',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
    backgroundColor: 'transparent',
  },
  metaText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.sm,
  },
  statusBadge: {
    paddingVertical: Layout.spacing.xs,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.pill,
    alignSelf: 'flex-start',
  },
  statusBadgeText: {
    color: '#fff', // Assuming light text on colored badges
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: '600',
    marginBottom: Layout.spacing.sm,
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bodyText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.md * 1.5,
    marginBottom: Layout.spacing.xs,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
    backgroundColor: 'transparent',
  },
  actionIcon: {
    marginRight: Layout.spacing.sm,
    marginTop: 2,
  },
  errorText: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});