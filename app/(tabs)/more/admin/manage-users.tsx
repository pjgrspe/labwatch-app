// app/(tabs)/more/admin/manage-users.tsx
import { Card, ThemedText } from '@/components';
import { useThemeColor } from '@/hooks';
import { Auth } from '@/modules';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, View } from 'react-native';

export default function ManageUsersScreen() {
  const [pendingUsers, setPendingUsers] = useState<Auth.UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const approveButtonColor = useThemeColor({}, 'successText');
  const denyButtonColor = useThemeColor({}, 'errorText');
  const activityIndicatorColor = useThemeColor({}, 'tint');

  const fetchPendingUsers = async () => {
    setIsLoading(true);
    try {
      const users = await Auth.AuthService.getPendingUsers();
      setPendingUsers(users);
    } catch (error) {
      Alert.alert("Error", "Failed to fetch pending users.");
      console.error("Fetch pending users error:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  // SIMPLIFIED: Remove permission checks, let Firestore rules handle it
  const handleApprove = async (uid: string) => {
    Alert.alert(
      "Confirm Approval",
      "Are you sure you want to approve this user?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Approve",
          onPress: async () => {
            try {
              await Auth.AuthService.approveUser(uid);
              Alert.alert("Success", "User approved.");
              fetchPendingUsers(); // Refresh list
            } catch (error: any) {
              console.error("Error approving user:", error);
              Alert.alert("Error", `Failed to approve user: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  const handleDeny = async (uid: string) => {
     Alert.alert(
      "Confirm Denial",
      "Are you sure you want to deny this user registration?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deny Registration",
          style: "destructive",
          onPress: async () => {
            try {
              await Auth.AuthService.denyUser(uid);
              Alert.alert("Success", "User registration denied.");
              fetchPendingUsers(); // Refresh list
            } catch (error: any) {
              console.error("Error denying user:", error);
              Alert.alert("Error", `Failed to deny user: ${error.message}`);
            }
          },
        },
      ]
    );
  };

  // FIXED: Helper function to safely format date
  const formatDate = (dateValue: any): string => {
    try {
      if (!dateValue) return 'N/A';
      
      // Handle Firestore Timestamp
      if (dateValue.toDate && typeof dateValue.toDate === 'function') {
        return dateValue.toDate().toLocaleDateString();
      }
      
      // Handle regular Date object or string
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }
      
      return date.toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'N/A';
    }
  };

  const renderUserItem = ({ item }: { item: Auth.UserProfile }) => (
    <Card style={styles.userItemCard}>
        <ThemedText style={[styles.userName, {color: textColor}]}>
          {item.fullName || 'N/A'}
        </ThemedText>
        <ThemedText style={[styles.userEmail, {color: textColor}]}>
          {item.email || 'N/A'}
        </ThemedText>
        <ThemedText style={[styles.userStatus, {color: textColor}]}>
          Status: {item.status || 'Unknown'}
        </ThemedText>
        <ThemedText style={[styles.userDate, {color: textColor}]}>
          Registered: {formatDate(item.createdAt)}
        </ThemedText>
        <View style={styles.actionsContainer}>
            <View style={styles.buttonWrapper}>
                <Button 
                  title="Approve" 
                  onPress={() => handleApprove(item.uid)} 
                  color={approveButtonColor} 
                />
            </View>
            <View style={styles.buttonWrapper}>
                 <Button 
                   title="Deny" 
                   onPress={() => handleDeny(item.uid)} 
                   color={denyButtonColor} 
                 />
            </View>
        </View>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>
          Loading pending users...
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      {pendingUsers.length === 0 && !isLoading ? (
        <View style={styles.centered}>
            <ThemedText style={{color: textColor, fontSize: 16}}>
              No pending user signups.
            </ThemedText>
        </View>
      ) : (
        <FlatList
          data={pendingUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.uid}
          contentContainerStyle={styles.listContent}
          onRefresh={fetchPendingUsers}
          refreshing={refreshing}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
   centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userItemCard: {
    marginBottom: 12,
    padding: 15,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  userEmail: {
    fontSize: 14,
    marginVertical: 2,
  },
  userStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    marginBottom: 10,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    backgroundColor: 'transparent'
  },
  buttonWrapper: {
    marginHorizontal: 5,
    flex: 1,
  },
});