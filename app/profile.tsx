// labwatch-app/app/profile.tsx
import { Card, ListItem } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Image,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

// Enhanced User Data with more realistic information
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  labAccess: string[];
  trainingsCompleted: Training[];
  contact: {
    office: string;
    phone: string;
    emergencyContact?: string;
  };
  profilePictureUrl: string;
  employeeId: string;
  startDate: string;
  supervisor: string;
  certifications: Certification[];
  recentActivity: ActivityLog[];
}

interface Training {
  id: string;
  name: string;
  completedOn: string;
  expiresOn?: string;
  status: 'current' | 'expired' | 'expiring-soon';
  certificate?: string;
}

interface Certification {
  id: string;
  name: string;
  issuedBy: string;
  issuedOn: string;
  expiresOn: string;
  status: 'active' | 'expired' | 'pending-renewal';
}

interface ActivityLog {
  id: string;
  action: string;
  timestamp: string;
  location?: string;
}

const dummyUser: User = {
  id: 'user_001',
  name: 'Dr. Alex Chen',
  email: 'alex.chen@university.edu',
  role: 'Senior Research Scientist',
  department: 'Molecular Biology & Genetics',
  employeeId: 'EMP-2024-001',
  startDate: '2020-03-15',
  supervisor: 'Prof. Sarah Johnson',
  labAccess: [
    'Molecular Biology Lab (Level 3)',
    'Protein Synthesis Lab (Level 2)', 
    'Cold Storage Room A (Level 1)',
    'Equipment Room B-12',
    'Conference Room Alpha'
  ],
  trainingsCompleted: [
    { 
      id: 'train001', 
      name: 'Laboratory Safety Fundamentals', 
      completedOn: '2024-01-15',
      expiresOn: '2025-01-15',
      status: 'current',
      certificate: 'CERT-LSF-2024-001'
    },
    { 
      id: 'train002', 
      name: 'Chemical Handling & Waste Management', 
      completedOn: '2024-02-20',
      expiresOn: '2025-02-20',
      status: 'current',
      certificate: 'CERT-CHW-2024-002'
    },
    { 
      id: 'train003', 
      name: 'Fire Safety & Emergency Response', 
      completedOn: '2023-03-10',
      expiresOn: '2024-03-10',
      status: 'expired',
      certificate: 'CERT-FSE-2023-003'
    },
    { 
      id: 'train004', 
      name: 'Biosafety Level 2 Procedures', 
      completedOn: '2024-01-05',
      expiresOn: '2024-12-05',
      status: 'expiring-soon',
      certificate: 'CERT-BSL2-2024-004'
    },
  ],
  certifications: [
    {
      id: 'cert001',
      name: 'Certified Laboratory Professional',
      issuedBy: 'American Society for Clinical Laboratory Science',
      issuedOn: '2022-06-15',
      expiresOn: '2025-06-15',
      status: 'active'
    },
    {
      id: 'cert002',
      name: 'Radiation Safety Officer',
      issuedBy: 'Health Physics Society',
      issuedOn: '2023-09-20',
      expiresOn: '2026-09-20',
      status: 'active'
    }
  ],
  recentActivity: [
    {
      id: 'act001',
      action: 'Accessed Molecular Biology Lab',
      timestamp: '2024-01-15T14:30:00Z',
      location: 'Building A, Floor 3'
    },
    {
      id: 'act002',
      action: 'Completed equipment maintenance check',
      timestamp: '2024-01-15T11:45:00Z',
      location: 'Equipment Room B-12'
    },
    {
      id: 'act003',
      action: 'Updated research protocol documentation',
      timestamp: '2024-01-14T16:20:00Z'
    }
  ],
  contact: {
    office: 'Building C, Room 301',
    phone: '+1 (555) 123-4567',
    emergencyContact: '+1 (555) 987-6543'
  },
  profilePictureUrl: 'https://via.placeholder.com/150/007AFF/FFFFFF?text=AC'
};

export default function ProfileScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const secondaryTextColor = useThemeColor({}, 'icon');
  const primaryColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({}, 'borderColor');
  const cardBackgroundColor = useThemeColor({}, 'cardBackground');
  const successColor = '#00AA00';
  const warningColor = '#FF8800';
  const errorColor = '#FF4444';

  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<User>(dummyUser);

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call to refresh user data
      await new Promise(resolve => setTimeout(resolve, 1000));
      // In real app, fetch fresh user data here
      setUser({ ...dummyUser }); // Refresh with same data for demo
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    } finally {
      setRefreshing(false);
    }
  };

  const getTrainingStatusColor = (status: string) => {
    switch (status) {
      case 'current': return successColor;
      case 'expiring-soon': return warningColor;
      case 'expired': return errorColor;
      default: return secondaryTextColor;
    }
  };

  const getTrainingStatusIcon = (status: string) => {
    switch (status) {
      case 'current': return 'checkmark-circle';
      case 'expiring-soon': return 'warning';
      case 'expired': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const getCertificationStatusColor = (status: string) => {
    switch (status) {
      case 'active': return successColor;
      case 'pending-renewal': return warningColor;
      case 'expired': return errorColor;
      default: return secondaryTextColor;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleEditProfile = () => {
    Alert.alert(
      'Edit Profile',
      'Profile editing functionality would be implemented here',
      [{ text: 'OK' }]
    );
  };

  const handleViewCertificate = (certificateId: string) => {
    Alert.alert(
      'View Certificate',
      `Certificate ${certificateId} would be displayed here`,
      [{ text: 'OK' }]
    );
  };

  const handleRenewTraining = (trainingId: string) => {
    Alert.alert(
      'Renew Training',
      'This would initiate the training renewal process',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Renew', onPress: () => Alert.alert('Success', 'Training renewal initiated') }
      ]
    );
  };
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Stack.Screen 
        options={{ 
          title: 'My Profile',
          headerRight: () => (
            <TouchableOpacity onPress={handleEditProfile}>
              <Ionicons name="create-outline" size={24} color={primaryColor} />
            </TouchableOpacity>
          )
        }} 
      />

      {/* Profile Header */}
      <Card style={styles.profileHeaderCard}>
        <View style={styles.avatarContainer}>
          <Image source={{ uri: user.profilePictureUrl }} style={styles.avatar} />
          <TouchableOpacity 
            style={[styles.avatarEditButton, { backgroundColor: primaryColor }]}
            onPress={() => Alert.alert('Change Photo', 'Profile photo change functionality would be implemented here')}
          >
            <Ionicons name="camera" size={16} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={[styles.name, { color: textColor }]}>{user.name}</Text>
        <Text style={[styles.role, { color: secondaryTextColor }]}>{user.role}</Text>
        <Text style={[styles.department, { color: secondaryTextColor }]}>{user.department}</Text>
        <Text style={[styles.email, { color: primaryColor }]}>{user.email}</Text>
        
        <View style={styles.employeeInfo}>
          <View style={styles.employeeInfoItem}>
            <Text style={[styles.employeeInfoLabel, { color: secondaryTextColor }]}>Employee ID</Text>
            <Text style={[styles.employeeInfoValue, { color: textColor }]}>{user.employeeId}</Text>
          </View>
          <View style={styles.employeeInfoItem}>
            <Text style={[styles.employeeInfoLabel, { color: secondaryTextColor }]}>Start Date</Text>
            <Text style={[styles.employeeInfoValue, { color: textColor }]}>{formatDate(user.startDate)}</Text>
          </View>
        </View>
      </Card>

      {/* Contact Information */}
      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="call-outline" size={20} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Contact Information</Text>
        </View>
        <ListItem title="Office" subtitle={user.contact.office} showBorder={true} />
        <ListItem title="Phone" subtitle={user.contact.phone} showBorder={true} />
        {user.contact.emergencyContact && (
          <ListItem title="Emergency Contact" subtitle={user.contact.emergencyContact} showBorder={true} />
        )}
        <ListItem title="Supervisor" subtitle={user.supervisor} showBorder={false} />
      </Card>

      {/* Lab Access Permissions */}
      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="key-outline" size={20} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Lab Access Permissions</Text>
        </View>
        {user.labAccess.map((lab, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => Alert.alert('Lab Access', `Details for ${lab} would be shown here`)}
          >
            <ListItem 
              title={lab} 
              rightIconName="chevron-forward-outline"
              showBorder={index < user.labAccess.length - 1} 
            />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Training Records */}
      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="school-outline" size={20} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Training Records</Text>
        </View>
        {user.trainingsCompleted.map((training, index) => (
          <TouchableOpacity
            key={training.id}
            onPress={() => handleViewCertificate(training.certificate || '')}
            style={[
              styles.trainingItem,
              index < user.trainingsCompleted.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
            ]}
          >
            <View style={styles.trainingContent}>
              <View style={styles.trainingHeader}>
                <Text style={[styles.trainingName, { color: textColor }]}>{training.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getTrainingStatusColor(training.status) + '20' }]}>
                  <Ionicons 
                    name={getTrainingStatusIcon(training.status)} 
                    size={14} 
                    color={getTrainingStatusColor(training.status)} 
                  />
                  <Text style={[styles.statusText, { color: getTrainingStatusColor(training.status) }]}>
                    {training.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.trainingDate, { color: secondaryTextColor }]}>
                Completed: {formatDate(training.completedOn)}
              </Text>
              {training.expiresOn && (
                <Text style={[styles.trainingExpiry, { color: secondaryTextColor }]}>
                  Expires: {formatDate(training.expiresOn)}
                </Text>
              )}
              {training.status === 'expired' || training.status === 'expiring-soon' ? (
                <TouchableOpacity
                  style={[styles.renewButton, { backgroundColor: warningColor }]}
                  onPress={() => handleRenewTraining(training.id)}
                >
                  <Text style={styles.renewButtonText}>Renew Training</Text>
                </TouchableOpacity>
              ) : null}
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Professional Certifications */}
      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="ribbon-outline" size={20} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Professional Certifications</Text>
        </View>
        {user.certifications.map((cert, index) => (
          <TouchableOpacity
            key={cert.id}
            style={[
              styles.certificationItem,
              index < user.certifications.length - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
            ]}
          >
            <View style={styles.certificationContent}>
              <View style={styles.certificationHeader}>
                <Text style={[styles.certificationName, { color: textColor }]}>{cert.name}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getCertificationStatusColor(cert.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getCertificationStatusColor(cert.status) }]}>
                    {cert.status.replace('-', ' ').toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={[styles.certificationIssuer, { color: secondaryTextColor }]}>{cert.issuedBy}</Text>
              <Text style={[styles.certificationDate, { color: secondaryTextColor }]}>
                Issued: {formatDate(cert.issuedOn)} | Expires: {formatDate(cert.expiresOn)}
              </Text>
            </View>
            <Ionicons name="chevron-forward-outline" size={20} color={secondaryTextColor} />
          </TouchableOpacity>
        ))}
      </Card>

      {/* Recent Activity */}
      <Card>
        <View style={styles.sectionHeader}>
          <Ionicons name="time-outline" size={20} color={primaryColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Recent Activity</Text>
        </View>
        {user.recentActivity.slice(0, 5).map((activity, index) => (
          <View
            key={activity.id}
            style={[
              styles.activityItem,
              index < Math.min(user.recentActivity.length, 5) - 1 && { borderBottomWidth: 1, borderBottomColor: borderColor }
            ]}
          >
            <View style={styles.activityContent}>
              <Text style={[styles.activityAction, { color: textColor }]}>{activity.action}</Text>
              <Text style={[styles.activityTime, { color: secondaryTextColor }]}>
                {formatDateTime(activity.timestamp)}
              </Text>
              {activity.location && (
                <Text style={[styles.activityLocation, { color: secondaryTextColor }]}>
                  📍 {activity.location}
                </Text>
              )}
            </View>
          </View>
        ))}
        <TouchableOpacity
          style={styles.viewAllButton}
          onPress={() => Alert.alert('Activity Log', 'Full activity log would be displayed here')}
        >
          <Text style={[styles.viewAllText, { color: primaryColor }]}>View All Activity</Text>
          <Ionicons name="chevron-forward-outline" size={16} color={primaryColor} />
        </TouchableOpacity>
      </Card>
    </ScrollView>
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
  profileHeaderCard: {
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
    padding: Layout.spacing.lg,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Layout.spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: Layout.fontSize.xl,
    fontFamily: 'Montserrat-Bold',
    marginBottom: Layout.spacing.xs,
    textAlign: 'center',
  },
  role: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs / 2,
    textAlign: 'center',
  },
  department: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.sm,
    textAlign: 'center',
  },
  email: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.md,
    textAlign: 'center',
  },
  employeeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingTop: Layout.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  employeeInfoItem: {
    alignItems: 'center',
  },
  employeeInfoLabel: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs / 2,
  },
  employeeInfoValue: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.md,
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginLeft: Layout.spacing.sm,
  },
  trainingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
  },
  trainingContent: {
    flex: 1,
  },
  trainingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  trainingName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Layout.spacing.xs,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
    gap: 4,
  },
  statusText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
  },
  trainingDate: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs / 2,
  },
  trainingExpiry: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs,
  },
  renewButton: {
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs,
    borderRadius: Layout.borderRadius.sm,
    alignSelf: 'flex-start',
    marginTop: Layout.spacing.xs,
  },
  renewButtonText: {
    color: 'white',
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-SemiBold',
  },
  certificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
  },
  certificationContent: {
    flex: 1,
  },
  certificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Layout.spacing.xs,
  },
  certificationName: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
    marginRight: Layout.spacing.sm,
  },
  certificationIssuer: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs / 2,
  },
  certificationDate: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  activityItem: {
    paddingVertical: Layout.spacing.md,
    paddingHorizontal: Layout.spacing.sm,
  },
  activityContent: {
    flex: 1,
  },
  activityAction: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs / 2,
  },
  activityTime: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs / 2,
  },
  activityLocation: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Layout.spacing.sm,
    gap: Layout.spacing.xs,
  },
  viewAllText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
  },
});