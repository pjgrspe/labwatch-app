// app/(tabs)/more/protocols/index.tsx
import { Card } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Protocol {
  id: string;
  name: string;
  summary: string;
  icon: keyof typeof Ionicons.glyphMap;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastUpdated: string;
  estimatedTime: string;
  requiredPersonnel: string[];
}

const protocolsData: Protocol[] = [
  { 
    id: 'fire-safety', 
    name: 'Fire Safety & Evacuation Protocol', 
    summary: 'Complete fire emergency response procedures and building evacuation plan.',
    icon: 'flame-outline',
    category: 'Emergency Response',
    priority: 'critical',
    lastUpdated: '2024-01-15',
    estimatedTime: '3-5 minutes',
    requiredPersonnel: ['All Personnel', 'Floor Wardens', 'Safety Officer']
  },
  { 
    id: 'chemical-spill', 
    name: 'Chemical Spill Response', 
    summary: 'Immediate response procedures for handling hazardous chemical spills.',
    icon: 'flask-outline',
    category: 'Chemical Safety',
    priority: 'high',
    lastUpdated: '2024-01-10',
    estimatedTime: '10-15 minutes',
    requiredPersonnel: ['Spill Response Team', 'Safety Officer', 'Witnesses']
  },
  { 
    id: 'evacuation', 
    name: 'General Emergency Evacuation', 
    summary: 'Building evacuation routes, assembly points, and emergency procedures.',
    icon: 'walk-outline',
    category: 'Emergency Response',
    priority: 'high',
    lastUpdated: '2024-01-12',
    estimatedTime: '2-4 minutes',
    requiredPersonnel: ['All Personnel', 'Floor Wardens']
  },
  { 
    id: 'first-aid', 
    name: 'First Aid & Medical Emergency', 
    summary: 'Initial response protocols for medical emergencies and injuries.',
    icon: 'medkit-outline',
    category: 'Medical Response',
    priority: 'high',
    lastUpdated: '2024-01-08',
    estimatedTime: '1-3 minutes',
    requiredPersonnel: ['First Aid Certified Personnel', 'Witnesses']
  },
  {
    id: 'gas-leak',
    name: 'Gas Leak Emergency Response',
    summary: 'Detection and response procedures for gas leaks in laboratory areas.',
    icon: 'warning-outline',
    category: 'Chemical Safety',
    priority: 'critical',
    lastUpdated: '2024-01-14',
    estimatedTime: '1-2 minutes',
    requiredPersonnel: ['All Personnel', 'Maintenance Team', 'Safety Officer']
  },
  {
    id: 'power-outage',
    name: 'Power Outage Protocol',
    summary: 'Procedures for maintaining lab safety during electrical power failures.',
    icon: 'flash-off-outline',
    category: 'Infrastructure',
    priority: 'medium',
    lastUpdated: '2024-01-11',
    estimatedTime: '5-10 minutes',
    requiredPersonnel: ['Lab Personnel', 'Maintenance Team']
  },
  {
    id: 'biohazard',
    name: 'Biological Hazard Response',
    summary: 'Containment and cleanup procedures for biological contamination incidents.',
    icon: 'nuclear-outline',
    category: 'Biosafety',
    priority: 'critical',
    lastUpdated: '2024-01-13',
    estimatedTime: '15-30 minutes',
    requiredPersonnel: ['Biosafety Team', 'Safety Officer', 'Lab Personnel']
  },
  {
    id: 'equipment-failure',
    name: 'Critical Equipment Failure',
    summary: 'Response procedures for critical laboratory equipment malfunctions.',
    icon: 'construct-outline',
    category: 'Equipment',
    priority: 'medium',
    lastUpdated: '2024-01-09',
    estimatedTime: '2-5 minutes',
    requiredPersonnel: ['Equipment Operators', 'Maintenance Team']
  }
];

export default function ProtocolsListScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');

  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [protocols, setProtocols] = useState<Protocol[]>(protocolsData);

  const categories = ['all', ...Array.from(new Set(protocolsData.map(p => p.category)))];

  const filteredProtocols = protocols.filter(protocol => {
    const matchesSearch = protocol.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         protocol.summary.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || protocol.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh protocols
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProtocols([...protocolsData]); // Refresh with same data for demo
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh protocols');
    } finally {
      setRefreshing(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#FF4444';
      case 'high': return '#FF8800';
      case 'medium': return '#FFAA00';
      case 'low': return '#00AA00';
      default: return secondaryTextColor;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'help-circle';
    }
  };

  const handleEmergencyCall = () => {
    Alert.alert(
      'Emergency Services',
      'Call emergency services immediately?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call 911', 
          style: 'destructive',
          onPress: () => Alert.alert('Emergency Call', 'This would initiate an emergency call to 911')
        }
      ]
    );
  };

  const renderProtocolItem = ({ item }: { item: Protocol }) => (
    <TouchableOpacity onPress={() => router.push(`/(tabs)/more/protocols/${item.id}` as any)}>
      <Card style={styles.protocolCard}>
        <View style={styles.protocolHeader}>
          <View style={styles.protocolTitleRow}>
            <View style={[styles.iconContainer, { backgroundColor: primaryColor + '15' }]}>
              <Ionicons name={item.icon} size={24} color={primaryColor} />
            </View>
            <View style={styles.protocolTitleContent}>
              <Text style={[styles.protocolName, { color: textColor }]}>{item.name}</Text>
              <Text style={[styles.protocolCategory, { color: secondaryTextColor }]}>{item.category}</Text>
            </View>
            <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) + '20' }]}>
              <Ionicons 
                name={getPriorityIcon(item.priority)} 
                size={14} 
                color={getPriorityColor(item.priority)} 
              />
              <Text style={[styles.priorityText, { color: getPriorityColor(item.priority) }]}>
                {item.priority.toUpperCase()}
              </Text>
            </View>
          </View>
        </View>
        
        <Text style={[styles.protocolSummary, { color: secondaryTextColor }]}>{item.summary}</Text>
        
        <View style={styles.protocolMeta}>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metaText, { color: secondaryTextColor }]}>{item.estimatedTime}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="people-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metaText, { color: secondaryTextColor }]}>
              {item.requiredPersonnel.length} roles
            </Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={14} color={secondaryTextColor} />
            <Text style={[styles.metaText, { color: secondaryTextColor }]}>
              Updated {new Date(item.lastUpdated).toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.protocolActions}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: primaryColor + '15' }]}
            onPress={() => router.push(`/(tabs)/more/protocols/${item.id}` as any)}
          >
            <Ionicons name="document-text-outline" size={16} color={primaryColor} />
            <Text style={[styles.actionText, { color: primaryColor }]}>View Protocol</Text>
          </TouchableOpacity>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Emergency Protocols',
          headerRight: () => (
            <TouchableOpacity onPress={handleEmergencyCall}>
              <Ionicons name="call" size={24} color="#FF4444" />
            </TouchableOpacity>
          )
        }} 
      />
      <View style={[styles.container, { backgroundColor }]}>
        {/* Search and Filter Header */}
        <View style={[styles.headerContainer, { backgroundColor: cardBackgroundColor, borderColor }]}>
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color={secondaryTextColor} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search protocols..."
              placeholderTextColor={secondaryTextColor}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          
          <View style={styles.categoryContainer}>
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={categories}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.categoryButton,
                    { borderColor },
                    selectedCategory === item && { 
                      backgroundColor: primaryColor, 
                      borderColor: primaryColor 
                    }
                  ]}
                  onPress={() => setSelectedCategory(item)}
                >
                  <Text style={[
                    styles.categoryText,
                    { color: selectedCategory === item ? 'white' : textColor }
                  ]}>
                    {item === 'all' ? 'All Categories' : item}
                  </Text>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.categoryScrollContent}
            />
          </View>
        </View>

        {/* Emergency Quick Actions */}
        <View style={[styles.emergencyActions, { backgroundColor: '#FF4444' + '10', borderColor: '#FF4444' + '30' }]}>
          <Text style={[styles.emergencyTitle, { color: '#FF4444' }]}>Emergency Quick Actions</Text>
          <View style={styles.emergencyButtons}>
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: '#FF4444' }]}
              onPress={handleEmergencyCall}
            >
              <Ionicons name="call" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Call 911</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: '#FF8800' }]}
              onPress={() => Alert.alert('Fire Alarm', 'This would trigger the fire alarm system')}
            >
              <Ionicons name="alarm-outline" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Fire Alarm</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.emergencyButton, { backgroundColor: primaryColor }]}
              onPress={() => Alert.alert('Security', 'This would alert campus security')}
            >
              <Ionicons name="shield-outline" size={20} color="white" />
              <Text style={styles.emergencyButtonText}>Security</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Results Summary */}
        <View style={styles.resultsContainer}>
          <Text style={[styles.resultsText, { color: secondaryTextColor }]}>
            Showing {filteredProtocols.length} of {protocols.length} protocols
          </Text>
        </View>

        {/* Protocols List */}
        <FlatList
          data={filteredProtocols}
          renderItem={renderProtocolItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={secondaryTextColor} />
              <Text style={[styles.emptyStateText, { color: secondaryTextColor }]}>
                No protocols found matching your search
              </Text>
            </View>
          }
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerContainer: {
    padding: Layout.spacing.md,
    borderBottomWidth: 1,
    gap: Layout.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.sm,
    height: 40,
  },
  searchIcon: {
    marginRight: Layout.spacing.xs,
  },  searchInput: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  categoryContainer: {
    height: 40,
  },
  categoryScrollContent: {
    paddingRight: Layout.spacing.md,
  },
  categoryButton: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.xs,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.lg,
    marginRight: Layout.spacing.sm,
    justifyContent: 'center',
  },  categoryText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  emergencyActions: {
    margin: Layout.spacing.md,
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.lg,
    borderWidth: 1,
  },
  emergencyTitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  emergencyButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: Layout.spacing.sm,
  },
  emergencyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.xs,
  },
  emergencyButtonText: {
    color: 'white',
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  resultsContainer: {
    paddingHorizontal: Layout.spacing.md,
    paddingBottom: Layout.spacing.sm,
  },
  resultsText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  listContent: {
    padding: Layout.spacing.md,
    paddingTop: 0,
  },
  protocolCard: {
    marginBottom: Layout.spacing.md,
    padding: Layout.spacing.md,
  },
  protocolHeader: {
    marginBottom: Layout.spacing.sm,
  },
  protocolTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Layout.spacing.sm,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  protocolTitleContent: {
    flex: 1,
  },
  protocolName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
  },  protocolCategory: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
    gap: 4,
  },
  priorityText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Bold',
  },
  protocolSummary: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
    marginBottom: Layout.spacing.sm,
  },
  protocolMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.sm,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs / 2,
  },
  metaText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
  },
  protocolActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    gap: Layout.spacing.xs / 2,
  },  actionText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xl * 2,
  },
  emptyStateText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    marginTop: Layout.spacing.md,
  },
});