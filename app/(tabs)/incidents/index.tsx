import { Card, ThemedText, ThemedView } from '@/components';
import { Colors, Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Incident } from '@/types/incidents';
import { getIncidents } from '@/utils/firebaseUtils';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function IncidentsListScreen() {
  const router = useRouter();
  const containerBackgroundColor = useThemeColor({}, 'background');
  const incidentTitleColor = useThemeColor({}, 'text');
  const incidentInfoColor = useThemeColor({}, 'icon');
  const tintColor = useThemeColor({}, 'tint');
  const errorTextColor = useThemeColor({}, 'errorText');
  const warningTextColor = useThemeColor({}, 'warningText');
  const successTextColor = useThemeColor({}, 'successText');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const borderColor = useThemeColor({}, 'borderColor');
  const searchInputBackgroundColor = useThemeColor({light: Colors.light.surfaceSecondary, dark: Colors.dark.surfaceSecondary }, 'inputBackground');
  const searchInputTextColor = useThemeColor({}, 'text');
  const searchInputBorderColor = useThemeColor({}, 'borderColor');
  const searchIconInputColor = useThemeColor({}, 'icon');
  const placeholderTextColor = useThemeColor({}, 'icon');
  const headerBackgroundColor = useThemeColor({}, 'cardBackground');
  const currentTheme = useCurrentTheme();
  const fabBackgroundColor = useThemeColor({}, 'tint');
  const fabIconColor = useThemeColor({ light: '#FFFFFF', dark: '#FFFFFF' }, 'text');
  
  // Helper function to determine severity color (NOT a hook)
  const getSeverityColor = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return errorTextColor;
    if (severity === 'medium') return warningTextColor;
    return successTextColor;
  };

  // Helper function to get status icon
  const getStatusIcon = (status: string): keyof typeof Ionicons.glyphMap => {
    switch (status) {
      case 'open': return 'alert-circle-outline';
      case 'in_progress': return 'hourglass-outline';
      case 'resolved': return 'checkmark-circle-outline';
      case 'closed': return 'checkbox-outline';
      default: return 'help-circle-outline';
    }
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return errorTextColor;
      case 'in_progress': return warningTextColor;
      case 'resolved': return successTextColor;
      case 'closed': return incidentInfoColor;
      default: return incidentInfoColor;
    }
  };

  const handleAddIncident = () => {
    router.push('/modals/add-incident');
  };

  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIncidents = useCallback(async () => {
    try {
      setIsLoading(true);
      const fetchedIncidents = await getIncidents();
      setIncidents(fetchedIncidents);
      applyFilters(fetchedIncidents, searchTerm);
    } catch (error) {
      console.error("Failed to fetch incidents:", error);
      Alert.alert("Error", "Failed to load incidents.");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [searchTerm]);

  const applyFilters = (incidents: Incident[], search: string) => {
    if (search.trim() === '') {
      setFilteredIncidents(incidents);
      return;
    }
    
    const lowerSearchTerm = search.toLowerCase();
    const filtered = incidents.filter(incident => 
      incident.title.toLowerCase().includes(lowerSearchTerm) ||
      incident.description.toLowerCase().includes(lowerSearchTerm) ||
      (incident.roomName && incident.roomName.toLowerCase().includes(lowerSearchTerm)) ||
      incident.status.toLowerCase().includes(lowerSearchTerm) ||
      incident.severity.toLowerCase().includes(lowerSearchTerm)
    );
    
    setFilteredIncidents(filtered);
  };

  useFocusEffect(
    useCallback(() => {
      fetchIncidents();
    }, [fetchIncidents])
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchIncidents();
  }, [fetchIncidents]);

  useEffect(() => {
    applyFilters(incidents, searchTerm);
  }, [searchTerm, incidents]);

  const renderIncidentItem = ({ item }: { item: Incident }) => (
    <TouchableOpacity 
      onPress={() => router.push(`/(tabs)/incidents/${item.id}` as any)}
      style={styles.incidentItemTouchable}
      activeOpacity={0.8}
    >
      <Card style={[
        styles.incidentCard,
        { 
          backgroundColor: cardBackgroundColor,
          borderColor: borderColor,
          borderWidth: 1,
          marginVertical: Layout.spacing.sm,
        }
      ]}>
        <View style={styles.incidentContent}>
          <View style={styles.incidentIconContainer}>
            <Ionicons 
              name={getStatusIcon(item.status)} 
              size={28} 
              color={getStatusColor(item.status)}
            />
          </View>
          
          <View style={styles.incidentTextContainer}>
            <View style={styles.incidentHeader}>
              <ThemedText style={[styles.incidentTitle, { color: incidentTitleColor }]} numberOfLines={1}>
                {item.title}
              </ThemedText>
              <View style={styles.statusContainer}>
                <View style={[styles.statusBadge, { backgroundColor: getSeverityColor(item.severity) + '20' }]}>
                  <Ionicons name="warning" size={12} color={getSeverityColor(item.severity)} />
                  <ThemedText style={[styles.statusText, { color: getSeverityColor(item.severity) }]}>
                    {item.severity.toUpperCase()}
                  </ThemedText>
                </View>
              </View>
            </View>
            
            <View style={styles.incidentMeta}>
              <View style={styles.metaRow}>
                <Ionicons name="cube-outline" size={14} color={incidentInfoColor} />
                <ThemedText style={[styles.metaText, { color: incidentInfoColor }]} numberOfLines={1}>
                  {item.roomName || item.roomId}
                </ThemedText>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={incidentInfoColor} />
                <ThemedText style={[styles.metaText, { color: incidentInfoColor }]}>
                  {item.reportedAt ? new Date(item.reportedAt).toLocaleDateString() : 'N/A'}
                </ThemedText>
              </View>
              
              <View style={styles.metaRow}>
                <Ionicons name={getStatusIcon(item.status)} size={14} color={getStatusColor(item.status)} />
                <ThemedText style={[styles.metaText, { color: getStatusColor(item.status) }]}>
                  Status: {item.status.replace('_', ' ')}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>
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
          // headerRight: () => (
          //   <Link href="/modals/add-incident" asChild>
          //     <TouchableOpacity style={styles.headerButton}>
          //       <Ionicons name="add-circle-outline" size={28} color={tintColor} />
          //     </TouchableOpacity>
          //   </Link>
          // ),
        }}
      />
      <ThemedView style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
        {/* Enhanced Header with Search */}
        <View style={[styles.header, { backgroundColor: headerBackgroundColor }]}>
          <View style={styles.searchRow}>
            <View style={[styles.searchContainer, {backgroundColor: searchInputBackgroundColor, borderColor: searchInputBorderColor}]}>
              <Ionicons name="search-outline" size={20} color={searchIconInputColor} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, {color: searchInputTextColor}]}
                placeholder="Search incidents..."
                placeholderTextColor={placeholderTextColor}
                value={searchTerm}
                onChangeText={setSearchTerm}
                returnKeyType="search"
              />
              {searchTerm.length > 0 && (
                <TouchableOpacity onPress={() => setSearchTerm('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={searchIconInputColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Content */}
        {filteredIncidents.length === 0 && !isLoading ? (
          <View style={styles.centered}>
            <Ionicons 
              name={searchTerm.trim() === '' ? "sad-outline" : "search-outline"} 
              size={70} 
              color={incidentInfoColor} 
            />
            <ThemedText style={[styles.emptyStateText, {color: incidentTitleColor}]}>
              {searchTerm.trim() === '' 
                ? 'No incidents reported yet.' 
                : 'No incidents match your search.'}
            </ThemedText>
            <ThemedText style={[styles.emptyStateSubText, {color: incidentInfoColor}]}>
              {searchTerm.trim() === '' 
                ? 'Tap the "+" icon to add a new incident.' 
                : 'Try different search terms.'}
            </ThemedText>
            {searchTerm.trim() !== '' && (
              <TouchableOpacity
                style={[styles.resetButton, { borderColor: tintColor }]}
                onPress={() => setSearchTerm('')}
              >
                <ThemedText style={[styles.resetButtonText, { color: tintColor }]}>
                  Clear Search
                </ThemedText>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <FlatList
            data={filteredIncidents}
            renderItem={renderIncidentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={tintColor}/>
            }
            showsVerticalScrollIndicator={false}
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={10}
            windowSize={10}
          />
        )}

        {/* Floating Action Button */}
        <TouchableOpacity
          style={[
            styles.fab,
            { backgroundColor: fabBackgroundColor, shadowColor: Colors[currentTheme].shadowColor }
          ]}
          onPress={handleAddIncident}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={30} color={fabIconColor} />
        </TouchableOpacity>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.xl,
  },
  emptyStateText: {
    marginTop: Layout.spacing.lg,
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
    lineHeight: Layout.fontSize.lg * 1.4,
  },
  emptyStateSubText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.sm,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: Layout.spacing.lg,
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.lg,
    borderRadius: Layout.borderRadius.pill,
    borderWidth: 1,
  },
  resetButtonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  
  // Header Styles
  header: {
    paddingTop: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.xs,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.light.borderColor,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.sm,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    paddingHorizontal: Layout.spacing.md,
    height: 48,
  },
  searchIcon: {
    marginRight: Layout.spacing.sm,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  clearButton: {
    padding: Layout.spacing.xs,
  },
  
  // List Content
  listContent: {
    paddingTop: Layout.spacing.xs,
    paddingBottom: Layout.spacing.xl,
  },
  
  // Incident Item Styles
  incidentItemTouchable: {
    marginHorizontal: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  incidentCard: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
  },
  incidentContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
  },
  incidentIconContainer: {
    marginRight: Layout.spacing.md,
    alignItems: 'center',
    paddingTop: Layout.spacing.xs,
  },
  incidentTextContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  incidentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Layout.spacing.sm,
  },
  incidentTitle: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontWeight: Layout.fontWeight.semibold,
    fontFamily: 'Montserrat-SemiBold',
    marginRight: Layout.spacing.sm,
    lineHeight: Layout.fontSize.md * 1.3,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
    marginLeft: Layout.spacing.xs / 2,
  },
  incidentMeta: {
    gap: Layout.spacing.xs / 2,
    backgroundColor: 'transparent',
    marginBottom: Layout.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginLeft: Layout.spacing.xs,
    flex: 1,
  },
  headerButton: {
    marginRight: Layout.spacing.md,
  },
  fab: {
    position: 'absolute',
    bottom: Layout.spacing.xl,
    right: Layout.spacing.xl,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },
});