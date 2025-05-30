import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { app, auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const firestore = getFirestore(app);

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Theme colors following your app's pattern
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const inputBackgroundColor = useThemeColor({}, 'inputBackground');
  const inputBorderColor = useThemeColor({}, 'inputBorder');
  const placeholderTextColor = useThemeColor({}, 'inputPlaceholder');
  const primaryButtonColor = useThemeColor({}, 'primaryButton');
  const primaryButtonTextColor = useThemeColor({}, 'primaryButtonText');
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const mutedTextColor = useThemeColor({}, 'icon');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }
    
    setLoading(true);
    try {
      console.log("Attempting to sign in user...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("User signed in successfully:", user.uid);

      // Add a small delay to ensure auth state is fully propagated
      await new Promise(resolve => setTimeout(resolve, 1000));

      console.log("Fetching user document...");
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        console.log("User data retrieved:", userData);
        
        if (userData.status === "pending") {
          Alert.alert("Account Pending", "Your account is awaiting admin approval.");
          await signOut(auth);
          router.replace('/auth/pending-approval');
        } else if (userData.status === "denied") {
          Alert.alert("Account Denied", "Your account registration was denied. Please contact support or sign up again.");
          await signOut(auth);
          router.replace('/auth/denied');
        } else if (userData.status === "approved") {
          console.log("User approved, navigating to main app...");
          router.replace('/');
        } else {
          Alert.alert("Login Error", "Account status is unknown. Please contact support.");
          await signOut(auth);
        }
      } else {
        console.error("User document does not exist");
        Alert.alert("Login Error", "User data not found. Please contact support.");
        await signOut(auth);
      }
    } catch (error: any) {
      console.error("Login error details:", error);
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={[styles.container, { backgroundColor }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <Image 
              source={require('../../assets/images/logo-with-text.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <ThemedText style={[styles.title, { color: textColor }]}>
              Welcome Back
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
              Sign in to access LabWatch
            </ThemedText>
          </View>

          {/* Login Form */}
          <Card style={styles.formCard}>
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Email Address
                </ThemedText>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: inputBackgroundColor,
                    borderColor: inputBorderColor 
                  }
                ]}>
                  <Ionicons 
                    name="mail-outline" 
                    size={20} 
                    color={iconColor} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter your email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                    placeholderTextColor={placeholderTextColor}
                    editable={!loading}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Password
                </ThemedText>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: inputBackgroundColor,
                    borderColor: inputBorderColor 
                  }
                ]}>
                  <Ionicons 
                    name="lock-closed-outline" 
                    size={20} 
                    color={iconColor} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    placeholderTextColor={placeholderTextColor}
                    editable={!loading}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color={iconColor} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[
                  styles.loginButton,
                  { backgroundColor: primaryButtonColor },
                  loading && styles.disabledButton
                ]}
                onPress={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={primaryButtonTextColor} />
                    <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                      Signing in...
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                    Sign In
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <ThemedText style={[styles.signupText, { color: mutedTextColor }]}>
              Don't have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => router.replace('/auth/signup')}>
              <ThemedText style={[styles.signupLink, { color: tintColor }]}>
                Sign Up
              </ThemedText>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: Layout.spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Layout.spacing.xl,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: Layout.spacing.lg,
  },
  title: {
    fontSize: Layout.fontSize.xxl,
    fontFamily: 'Montserrat-Bold',
    textAlign: 'center',
    marginBottom: Layout.spacing.xs,
  },
  subtitle: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    textAlign: 'center',
  },
  formCard: {
    marginBottom: Layout.spacing.lg,
  },
  formContainer: {
    padding: Layout.spacing.lg,
  },
  inputGroup: {
    marginBottom: Layout.spacing.lg,
  },
  inputLabel: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Layout.borderRadius.md,
    paddingHorizontal: Layout.spacing.md,
    height: 52,
  },
  inputIcon: {
    marginRight: Layout.spacing.sm,
  },
  textInput: {
    flex: 1,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
    height: '100%',
  },
  eyeButton: {
    padding: Layout.spacing.xs,
  },
  loginButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Layout.spacing.md,
  },
  disabledButton: {
    opacity: 0.7,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Layout.spacing.sm,
  },
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  signupLink: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
});