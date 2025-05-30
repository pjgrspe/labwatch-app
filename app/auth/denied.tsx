import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function DeniedScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const errorTextColor = useThemeColor({}, 'errorText');
  const iconColor = useThemeColor({}, 'icon');
  const mutedTextColor = useThemeColor({}, 'icon');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonColor = useThemeColor({}, 'secondaryButton');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');
  const tintColor = useThemeColor({}, 'tint');

  const handleLogoutAndRedirect = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error("Logout error from denied screen:", error);
      router.replace('/auth/login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:support@labwatch.edu?subject=Account Access Denied - Support Request');
  };

  const handleTryAgain = () => {
    router.replace('/auth/signup');
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <Card style={styles.statusCard}>
          <View style={styles.statusContent}>
            {/* Icon */}
            <View style={[styles.iconContainer, { backgroundColor: errorTextColor + '15' }]}>
              <Ionicons name="close-circle-outline" size={48} color={errorTextColor} />
            </View>

            {/* Title */}
            <ThemedText style={[styles.title, { color: errorTextColor }]}>
              Access Denied
            </ThemedText>

            {/* Message */}
            <ThemedText style={[styles.message, { color: textColor }]}>
              Unfortunately, your account registration was not approved or your access has been revoked.
            </ThemedText>

            {/* Reasons */}
            <View style={styles.reasonsContainer}>
              <ThemedText style={[styles.reasonsTitle, { color: textColor }]}>
                Common reasons include:
              </ThemedText>
              <View style={styles.reasonsList}>
                <View style={styles.reasonItem}>
                  <Ionicons name="ellipse" size={6} color={iconColor} />
                  <ThemedText style={[styles.reasonText, { color: mutedTextColor }]}>
                    Incomplete or invalid information
                  </ThemedText>
                </View>
                <View style={styles.reasonItem}>
                  <Ionicons name="ellipse" size={6} color={iconColor} />
                  <ThemedText style={[styles.reasonText, { color: mutedTextColor }]}>
                    Not authorized for lab access
                  </ThemedText>
                </View>
                <View style={styles.reasonItem}>
                  <Ionicons name="ellipse" size={6} color={iconColor} />
                  <ThemedText style={[styles.reasonText, { color: mutedTextColor }]}>
                    Account policy violations
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Info Card */}
            <View style={[styles.infoCard, { backgroundColor: tintColor + '10' }]}>
              <Ionicons name="information-circle-outline" size={20} color={tintColor} />
              <ThemedText style={[styles.infoText, { color: tintColor }]}>
                If you believe this is an error, please contact our support team for assistance.
              </ThemedText>
            </View>
          </View>
        </Card>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: primaryButtonColor },
              isLoading && styles.disabledButton
            ]}
            onPress={handleContactSupport}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="mail-outline" size={20} color={primaryButtonTextColor} />
              <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                Contact Support
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { 
                backgroundColor: secondaryButtonColor,
                borderColor: secondaryButtonTextColor 
              }
            ]}
            onPress={handleTryAgain}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="person-add-outline" size={20} color={secondaryButtonTextColor} />
              <ThemedText style={[styles.buttonText, { color: secondaryButtonTextColor }]}>
                Create New Account
              </ThemedText>
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tertiaryButton,
              { borderColor: iconColor }
            ]}
            onPress={handleLogoutAndRedirect}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={iconColor} />
                <ThemedText style={[styles.buttonText, { color: iconColor }]}>
                  Signing out...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="log-out-outline" size={20} color={iconColor} />
                <ThemedText style={[styles.buttonText, { color: iconColor }]}>
                  Back to Login
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Support Info */}
        <View style={styles.supportContainer}>
          <View style={styles.supportItem}>
            <Ionicons name="mail-outline" size={16} color={tintColor} />
            <ThemedText style={[styles.supportText, { color: mutedTextColor }]}>
              support@labwatch.edu
            </ThemedText>
          </View>
          <View style={styles.supportItem}>
            <Ionicons name="call-outline" size={16} color={tintColor} />
            <ThemedText style={[styles.supportText, { color: mutedTextColor }]}>
              +63 (2) 8123-4567
            </ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  statusCard: {
    marginBottom: Layout.spacing.lg,
  },
  statusContent: {
    padding: Layout.spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: Layout.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.md,
  },
  message: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
    lineHeight: Layout.fontSize.md * 1.5,
    marginBottom: Layout.spacing.lg,
  },
  reasonsContainer: {
    width: '100%',
    marginBottom: Layout.spacing.lg,
  },
  reasonsTitle: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.sm,
  },
  reasonsList: {
    gap: Layout.spacing.xs,
  },
  reasonItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  reasonText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    flex: 1,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    gap: Layout.spacing.sm,
    width: '100%',
  },
  infoText: {
    flex: 1,
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  buttonContainer: {
    gap: Layout.spacing.md,
    marginBottom: Layout.spacing.lg,
  },
  primaryButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tertiaryButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  supportContainer: {
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.xs,
  },
  supportText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
  },
});