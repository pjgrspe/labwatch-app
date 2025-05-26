// app/(tabs)/more/admin/manage-users.tsx
import Card from '@/components/Card';
import { Text as ThemedText } from '@/components/Themed';
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthService, UserProfile } from '@/modules/auth/services/AuthService';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Button, FlatList, StyleSheet, View } from 'react-native';

export default function ManageUsersScreen() {
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
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
      const users = await AuthService.getPendingUsers();
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
              await AuthService.approveUser(uid);
              Alert.alert("Success", "User approved.");
              fetchPendingUsers(); // Refresh list
            } catch (error) {
              Alert.alert("Error", "Failed to approve user.");
            }
          },
        },
      ]
    );
  };

  const handleDeny = async (uid: string) => {
     Alert.alert(
      "Confirm Denial", // Changed title
      "Are you sure you want to deny this user registration? They will be informed on next login and may need to sign up again.", // Changed message
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Deny Registration", // Changed button text
          style: "destructive",
          onPress: async () => {
            try {
              await AuthService.denyUserRegistration(uid); // Use the updated/renamed function
              // Alert is now shown by denyUserRegistration
              fetchPendingUsers(); // Refresh list
            } catch (error) {
              // Error alert is handled by the service or here if needed
              Alert.alert("Error", "Failed to deny user registration.");
            }
          },
        },
      ]
    );
  };


  const renderUserItem = ({ item }: { item: UserProfile }) => (
    <Card style={styles.userItemCard}>
        <ThemedText style={[styles.userName, {color: textColor}]}>{item.fullName || 'N/A'}</ThemedText>
        <ThemedText style={[styles.userEmail, {color: textColor}]}>{item.email}</ThemedText>
        <ThemedText style={[styles.userStatus, {color: textColor}]}>Status: {item.status}</ThemedText>
        <ThemedText style={[styles.userDate, {color: textColor}]}>Registered: {new Date(item.createdAt).toLocaleDateString()}</ThemedText>
        <View style={styles.actionsContainer}>
            <View style={styles.buttonWrapper}>
                <Button title="Approve" onPress={() => handleApprove(item.uid)} color={approveButtonColor} />
            </View>
            <View style={styles.buttonWrapper}>
                 <Button title="Deny" onPress={() => handleDeny(item.uid)} color={denyButtonColor} /> {/* Changed button title */}
            </View>
        </View>
    </Card>
  );

  if (isLoading && !refreshing) {
    return (
      <View style={[styles.centered, { backgroundColor: containerBackgroundColor }]}>
        <ActivityIndicator size="large" color={activityIndicatorColor} />
        <ThemedText style={{ color: textColor, marginTop: 10 }}>Loading pending users...</ThemedText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: containerBackgroundColor }]}>
      {pendingUsers.length === 0 && !isLoading ? (
        <View style={styles.centered}>
            <ThemedText style={{color: textColor, fontSize: 16}}>No pending user signups.</ThemedText>
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
    // color: '#555', // Handled by theme
    marginVertical: 2,
  },
  userStatus: {
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 2,
  },
  userDate: {
    fontSize: 12,
    // color: '#777', // Handled by theme
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