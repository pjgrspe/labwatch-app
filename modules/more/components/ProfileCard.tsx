// modules/more/components/ProfileCard.tsx
import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useCurrentTheme, useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { User } from 'firebase/auth';
import React from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

interface ProfileCardProps {
  user: User | null;
  onPress: () => void;
  userRole?: string;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ user, onPress, userRole }) => {
  const currentTheme = useCurrentTheme();
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const subtitleColor = useThemeColor({}, 'icon');

  const getInitials = (displayName: string | null, email: string) => {
    if (displayName) {
      return displayName
        .split(' ')
        .map(name => name.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return email.charAt(0).toUpperCase();
  };

  return (
    <Card style={styles.container}>
      <TouchableOpacity onPress={onPress} style={styles.profileContainer} activeOpacity={0.7}>
        <ThemedView style={[styles.avatarContainer, { backgroundColor: tintColor + '20' }]}>
          {user?.photoURL ? (
            // You could add an Image component here for profile pictures
            <Ionicons name="person" size={32} color={tintColor} />
          ) : (
            <ThemedText style={[styles.initials, { color: tintColor }]}>
              {user ? getInitials(user.displayName, user.email || '') : 'U'}
            </ThemedText>
          )}
        </ThemedView>
        
        <ThemedView style={styles.userInfo}>          <ThemedText style={[styles.userName, { color: textColor }]}>
            {user?.displayName || user?.email?.split('@')[0] || 'Lab User'}
          </ThemedText>
          <ThemedText style={[styles.userEmail, { color: subtitleColor }]}>
            {user?.email || 'user@labwatch.com'}
          </ThemedText>
          {userRole && (
            <ThemedView style={[styles.roleBadge, { backgroundColor: tintColor + '15' }]}>
              <ThemedText style={[styles.roleText, { color: tintColor }]}>
                {userRole}
              </ThemedText>
            </ThemedView>
          )}
        </ThemedView>
        
        <Ionicons name="chevron-forward-outline" size={20} color={subtitleColor} />
      </TouchableOpacity>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: Layout.spacing.lg,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.xs,
  },
  avatarContainer: {
    width: 60,
    height: 60,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Layout.spacing.md,
  },
  initials: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
  },
  userInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  userName: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.xs,
  },
  userEmail: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    marginBottom: Layout.spacing.xs,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Layout.spacing.sm,
    paddingVertical: Layout.spacing.xs / 2,
    borderRadius: Layout.borderRadius.sm,
  },
  roleText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    textTransform: 'uppercase',
  },
});

export default ProfileCard;
