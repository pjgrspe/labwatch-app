// labwatch-app/app/(tabs)/incidents/index.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Incident } from '@/types/incidents';
import { getIncidents } from '@/utils/firebaseUtils'; // Or your IncidentService
import { Ionicons } from '@expo/vector-icons';
import { Link, Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

export default function IncidentsListScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const incidentTitleColor = useThemeColor({}, 'text');
  const incidentInfoColor = useThemeColor({}, 'icon');
  const fabBackgroundColor = useThemeColor({}, 'tint');
  const fabIconColor = useThemeColor({}, 'primaryButtonText'); // For FAB icon
  const tintColor = useThemeColor({}, 'tint');

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedIncidents = await getIncidents();
      setIncidents(fetchedIncidents);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [fetchIncidents])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents();
  }, [fetchIncidents]);

  const renderIncidentItem = ({ item }: { item: Incident }) => (
    <TouchableOpacity onPress={() => router.push(`/incident-details/${item.id}` as any)}>
      <Card style={styles.incidentCard}>
        <ThemedText style={[styles.incidentTitle, { color: incidentTitleColor }]}>{item.title}</ThemedText>
        <ThemedText style={[styles.incidentInfo, { color: incidentInfoColor }]}>
          Room: {item.roomName || item.roomId} | Status: {item.status}
        </ThemedText>
        <ThemedText style={[styles.incidentInfo, { color: incidentInfoColor }]}>
          Reported: {item.reportedAt ? new Date(item.reportedAt).toLocaleDateString() : 'N/A'}
        </ThemedText>
         <ThemedText style={[styles.incidentSeverity, { color: useThemeColor({}, item.severity === 'critical' || item.severity === 'high' ? 'errorText' : item.severity === 'medium' ? 'warningText' : 'successText')}]}>
          Severity: {item.severity}
        </ThemedText>
      </Card>
    </TouchableOpacity>
  );

  if (isLoading && !refreshing) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center', backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Incident History',
          headerRight: () => (
            <Link href="/modals/add-incident" asChild>
              <TouchableOpacity style={{ marginRight: Layout.spacing.md }}>
                <Ionicons name="add-circle-outline" size={28} color={tintColor} />
              </TouchableOpacity>
            </Link>
          ),
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {incidents.length === 0 && !isLoading ? (
          <ThemedView style={styles.emptyStateContainer}>
            <Ionicons name="sad-outline" size={64} color={incidentInfoColor} />
            <ThemedText style={[styles.emptyStateText, {color: incidentInfoColor}]}>No incidents reported yet.</ThemedText>
            <ThemedText style={[styles.emptyStateSubText, {color: incidentInfoColor}]}>Tap the '+' icon to add a new incident.</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={incidents}
            renderItem={renderIncidentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor}/>
            }
          />
        )}
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: Layout.spacing.md,
  },
  incidentCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  incidentTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    fontWeight: Layout.fontWeight.semibold,
    marginBottom: Layout.spacing.xs,
  },
  incidentInfo: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs / 2,
  },
  incidentSeverity: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.xs,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  emptyStateText: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Medium',
    marginTop: Layout.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
});