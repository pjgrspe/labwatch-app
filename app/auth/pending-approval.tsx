import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { AuthService } from '@/modules/auth/services/AuthService';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signOut } from 'firebase/auth';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native';

export default function PendingApprovalScreen() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Theme colors
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const mutedTextColor = useThemeColor({}, 'icon');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const secondaryButtonColor = useThemeColor({}, 'secondaryButton');
  const secondaryButtonTextColor = useThemeColor({}, 'secondaryButtonText');

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error("Logout error:", error);
      Alert.alert("Logout Error", "Failed to log out.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefreshStatus = async () => {
    setIsLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userProfile = await AuthService.getUserProfile(currentUser.uid);
        if (userProfile?.status === "approved") {
          router.replace('/(tabs)/dashboard');
        } else if (userProfile?.status === "denied") {
          Alert.alert(
            "Account Denied",
            "Your account registration was denied. Please contact support or sign up again.",
            [{ text: "OK", onPress: () => handleLogout() }]
          );
        } else if (userProfile?.status === "pending") {
          Alert.alert("Still Pending", "Your account is still awaiting approval. Please check back later.");
        } else {
          Alert.alert("Unknown Status", "Could not determine account status. Please try logging out and in again.");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        Alert.alert("Error", "Could not fetch your account status. Please try again.");
      }
    } else {
      Alert.alert("Not Authenticated", "Please log in again.",
        [{ text: "OK", onPress: () => router.replace('/auth/login') }]
      );
    }
    setIsLoading(false);
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
            <View style={[styles.iconContainer, { backgroundColor: tintColor + '15' }]}>
              <Ionicons name="hourglass-outline" size={48} color={tintColor} />
            </View>

            {/* Title */}
            <ThemedText style={[styles.title, { color: textColor }]}>
              Awaiting Approval
            </ThemedText>

            {/* Message */}
            <ThemedText style={[styles.message, { color: textColor }]}>
              Your account registration has been received and is currently being reviewed by our administrators.
            </ThemedText>

            {/* Steps */}
            <View style={styles.stepsContainer}>
              <View style={styles.step}>
                <View style={[styles.stepIcon, { backgroundColor: tintColor }]}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
                <ThemedText style={[styles.stepText, { color: textColor }]}>
                  Account created
                </ThemedText>
              </View>
              
              <View style={[styles.stepConnector, { backgroundColor: tintColor }]} />
              
              <View style={styles.step}>
                <View style={[styles.stepIcon, { backgroundColor: tintColor }]}>
                  <ActivityIndicator size="small" color="white" />
                </View>
                <ThemedText style={[styles.stepText, { color: textColor }]}>
                  Admin review
                </ThemedText>
              </View>
              
              <View style={[styles.stepConnector, { backgroundColor: iconColor }]} />
              
              <View style={styles.step}>
                <View style={[styles.stepIcon, { backgroundColor: iconColor }]}>
                  <Ionicons name="person" size={16} color="white" />
                </View>
                <ThemedText style={[styles.stepText, { color: mutedTextColor }]}>
                  Access granted
                </ThemedText>
              </View>
            </View>

            {/* Info */}
            <View style={[styles.infoCard, { backgroundColor: tintColor + '10' }]}>
              <Ionicons name="information-circle-outline" size={20} color={tintColor} />
              <ThemedText style={[styles.infoText, { color: tintColor }]}>
                You will receive an email notification once your account has been approved. This usually takes 1-2 business days.
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
            onPress={handleRefreshStatus}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color={primaryButtonTextColor} />
                <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                  Checking...
                </ThemedText>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Ionicons name="refresh-outline" size={20} color={primaryButtonTextColor} />
                <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                  Check Status
                </ThemedText>
              </View>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.secondaryButton,
              { 
                backgroundColor: secondaryButtonColor,
                borderColor: secondaryButtonTextColor 
              }
            ]}
            onPress={handleLogout}
            disabled={isLoading}
          >
            <View style={styles.buttonContent}>
              <Ionicons name="log-out-outline" size={20} color={secondaryButtonTextColor} />
              <ThemedText style={[styles.buttonText, { color: secondaryButtonTextColor }]}>
                Sign Out
              </ThemedText>
            </View>
          </TouchableOpacity>
        </View>

        {/* Contact Support */}
        <View style={styles.supportContainer}>
          <ThemedText style={[styles.supportText, { color: mutedTextColor }]}>
            Need help? Contact support at{' '}
          </ThemedText>
          <TouchableOpacity>
            <ThemedText style={[styles.supportLink, { color: tintColor }]}>
              support@labwatch.edu
            </ThemedText>
          </TouchableOpacity>
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
    marginBottom: Layout.spacing.xl,
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  step: {
    alignItems: 'center',
    flex: 1,
  },
  stepIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Layout.spacing.xs,
  },
  stepText: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Medium',
    textAlign: 'center',
  },
  stepConnector: {
    flex: 1,
    height: 2,
    marginHorizontal: Layout.spacing.sm,
    marginBottom: Layout.spacing.lg,
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
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  supportText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  supportLink: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-SemiBold',
    textDecorationLine: 'underline',
  },
});