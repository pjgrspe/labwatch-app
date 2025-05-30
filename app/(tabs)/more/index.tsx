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
import { Alert, RefreshControl, ScrollView, StyleSheet } from 'react-native';

export default function MoreScreen() {
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const { currentUser, userRole, isLoading, refreshUserRole } = useMoreScreenData();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refreshUserRole();
    setRefreshing(false);
  }, [refreshUserRole]);

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
    {
      title: 'About LabWatch',
      subtitle: 'App version and information',
      route: '/(tabs)/more/about',
      icon: 'information-circle-outline',
    },
  ];

  const dataMenuItems: MenuItem[] = [
    {
      title: 'Data Export',
      subtitle: 'Export sensor data and reports',
      route: '/(tabs)/more/data-export',
      icon: 'download-outline',
    },
    {
      title: 'System Health',
      subtitle: 'Check sensor and network status',
      route: '/(tabs)/more/system-health',
      icon: 'pulse-outline',
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
        {
          title: 'System Configuration',
          subtitle: 'Global settings and thresholds',
          route: '/(tabs)/more/admin/config',
          icon: 'construct-outline',
        },
        {
          title: 'Audit Logs',
          subtitle: 'System activity and changes',
          route: '/(tabs)/more/admin/audit-logs',
          icon: 'list-outline',
        },
      ]
    : [];

  const supportMenuItems: MenuItem[] = [
    {
      title: 'Help & Support',
      subtitle: 'User guides and FAQs',
      route: '/(tabs)/more/help',
      icon: 'help-circle-outline',
    },
    {
      title: 'Report Issue',
      subtitle: 'Report bugs or request features',
      route: '/(tabs)/more/report-issue',
      icon: 'bug-outline',
    },
  ];

  const accountMenuItems: MenuItem[] = [
    {
      title: 'Sign Out',
      subtitle: 'Sign out of your account',
      icon: 'log-out-outline',
      onPress: handleSignOut,
      isDestructive: true,
    },
  ];

  // Enhanced quick stats with more relevant data
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
      label: 'Recent Incidents',
      value: '1',
      icon: 'warning-outline' as const,
      onPress: () => router.push('/(tabs)/incidents' as any),
    },
    {
      label: 'Online Sensors',
      value: '24/26',
      icon: 'radio-outline' as const,
      onPress: () => router.push('/(tabs)/more/system-health' as any),
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
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <ProfileCard
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

      <MenuSection
        title="Data & Monitoring"
        items={dataMenuItems}
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
        title="Support"
        items={supportMenuItems}
        onItemPress={handleItemPress}
      />

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