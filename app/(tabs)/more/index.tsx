// app/(tabs)/more/index.tsx
import { Loader } from '@/components';
import { Layout } from '@/constants';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import type { MenuItem } from '@/modules/more';
import { MenuSection, ProfileCard, QuickStatsCard, useMoreScreenData } from '@/modules/more';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React from 'react';
import { Alert, ScrollView, StyleSheet } from 'react-native';

export default function MoreScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const { currentUser, userRole, isLoading } = useMoreScreenData();

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              router.replace('/auth/login');
            } catch (error) {
              console.error('Sign out error:', error);
              Alert.alert('Error', 'Failed to sign out.');
            }
          },
        },
      ]
    );
  };

  const handleItemPress = (item: MenuItem) => {
    if (item.route) {
      router.push(item.route as any);
    } else if (item.onPress) {
      item.onPress();
    }
  };

  const appMenuItems: MenuItem[] = [
    {
      title: 'Emergency Protocols',
      subtitle: 'Safety guidelines and procedures',
      route: '/(tabs)/more/protocols',
      icon: 'document-text-outline',
    },
    {
      title: 'Settings',
      subtitle: 'App preferences and notifications',
      route: '/(tabs)/more/settings',
      icon: 'settings-outline',
    },
  ];

  const adminMenuItems: MenuItem[] = userRole.isSuperAdmin
    ? [
        {
          title: 'Manage Users',
          subtitle: 'User roles and permissions',
          route: '/(tabs)/more/admin/manage-users',
          icon: 'shield-checkmark-outline',
        },
      ]
    : [];
  const accountMenuItems: MenuItem[] = [
    {
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      onPress: handleSignOut,
      isDestructive: true,
    },
  ];
  // Mock stats - replace with real data from your services
  const quickStats = [
    {
      label: 'Active Rooms',
      value: '12',
      icon: 'business-outline' as const,
      onPress: () => router.push('/(tabs)/rooms' as any),
    },
    {
      label: 'Open Alerts',
      value: '3',
      icon: 'alert-circle-outline' as const,
      onPress: () => router.push('/(tabs)/alerts' as any),
    },
    {
      label: 'Incidents',
      value: '1',
      icon: 'warning-outline' as const,
      onPress: () => router.push('/(tabs)/incidents' as any),
    },
  ];

  if (isLoading) {
    return <Loader />;
  }

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >      <ProfileCard
        user={currentUser}
        userRole={userRole.displayRole}
        onPress={() => router.push('/profile')}
      />

      <QuickStatsCard stats={quickStats} />

      <MenuSection
        title="App Features"
        items={appMenuItems}
        onItemPress={handleItemPress}
      />

      {adminMenuItems.length > 0 && (
        <MenuSection
          title="Administration"
          items={adminMenuItems}
          onItemPress={handleItemPress}
        />
      )}

      <MenuSection
        title="Account"
        items={accountMenuItems}
        onItemPress={handleItemPress}
      />
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
});