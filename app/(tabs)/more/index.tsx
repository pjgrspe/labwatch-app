// app/(tabs)/more/index.tsx
import ListItem from '@/components/ListItem';
import { auth } from '@/FirebaseConfig'; // Import auth
import { useThemeColor } from '@/hooks/useThemeColor';
import { AuthService } from '@/modules/auth/services/AuthService'; // Import AuthService
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth'; // Import signOut
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, View } from 'react-native';

export default function MoreScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      setIsLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const adminStatus = await AuthService.isSuperAdmin(currentUser.uid);
          setIsSuperAdmin(adminStatus);
        } catch (error) {
          console.error('MoreScreen: Error checking admin status:', error);
          setIsSuperAdmin(false);
        }
      } else {
        setIsSuperAdmin(false);
      }
      setIsLoading(false);
    };
    checkAdminStatus();
  }, [auth.currentUser]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login'); // Redirect to login after sign out
    } catch (error) {
      console.error('Sign out error:', error);
      Alert.alert('Error', 'Failed to sign out.');
    }
  };

  const baseMenuItems = [
    { title: 'Emergency Protocols', route: '/(tabs)/more/protocols', icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Incident History', route: '/(tabs)/more/incidents', icon: 'archive-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Knowledge Base', route: '/(tabs)/more/knowledge-base', icon: 'book-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'Settings', route: '/(tabs)/more/settings', icon: 'settings-outline' as keyof typeof Ionicons.glyphMap },
    { title: 'My Profile', route: '/profile', icon: 'person-circle-outline' as keyof typeof Ionicons.glyphMap },
  ] as const;

  const adminMenuItem = { title: 'Admin: Manage Users', route: '/(tabs)/more/admin/manage-users', icon: 'shield-checkmark-outline' as keyof typeof Ionicons.glyphMap };

  // Add Logout item
  const menuItemsWithLogout = [
    ... (isSuperAdmin ? [...baseMenuItems, adminMenuItem] : baseMenuItems),
    { title: 'Logout', onPress: handleSignOut, icon: 'log-out-outline' as keyof typeof Ionicons.glyphMap },
  ];


  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor, justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color={tintColor} />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {menuItemsWithLogout.map((item) => (
        <ListItem
          key={item.title}
          title={item.title}
          onPress={() => {
            if ('route' in item && item.route) {
              router.push(item.route as any);
            } else if ('onPress' in item && item.onPress) {
              item.onPress();
            }
          }}
          rightIconName={'onPress' in item || ('route' in item && item.route) ? "chevron-forward-outline" : undefined}
          leftIconName={item.icon}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});