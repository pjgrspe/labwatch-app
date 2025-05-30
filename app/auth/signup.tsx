import { Card, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { app, auth } from '@/FirebaseConfig';
import { useThemeColor } from '@/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
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

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
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

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName.trim(),
        role: "user",
        status: "pending",
        createdAt: new Date(),
      });

      Alert.alert(
        "Account Created", 
        "Your account has been created successfully and is awaiting admin approval.",
        [{ text: "OK", onPress: () => router.replace('/auth/pending-approval') }]
      );
    } catch (error: any) {
      console.error("Signup error:", error);
      Alert.alert("Signup Failed", error.message || "An error occurred during signup. Please try again.");
    } finally {
      setIsLoading(false);
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
              Create Account
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: mutedTextColor }]}>
              Join LabWatch to start monitoring your lab
            </ThemedText>
          </View>

          {/* Signup Form */}
          <Card style={styles.formCard}>
            <View style={styles.formContainer}>
              {/* Full Name Input */}
              <View style={styles.inputGroup}>
                <ThemedText style={[styles.inputLabel, { color: textColor }]}>
                  Full Name
                </ThemedText>
                <View style={[
                  styles.inputContainer,
                  { 
                    backgroundColor: inputBackgroundColor,
                    borderColor: inputBorderColor 
                  }
                ]}>
                  <Ionicons 
                    name="person-outline" 
                    size={20} 
                    color={iconColor} 
                    style={styles.inputIcon} 
                  />
                  <TextInput
                    style={[styles.textInput, { color: textColor }]}
                    placeholder="Enter your full name"
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                    placeholderTextColor={placeholderTextColor}
                    editable={!isLoading}
                  />
                </View>
              </View>

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
                    editable={!isLoading}
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
                    editable={!isLoading}
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
                <ThemedText style={[styles.passwordHint, { color: mutedTextColor }]}>
                  Must be at least 6 characters long
                </ThemedText>
              </View>

              {/* Info Card */}
              <View style={[styles.infoCard, { backgroundColor: tintColor + '10' }]}>
                <Ionicons name="information-circle-outline" size={20} color={tintColor} />
                <ThemedText style={[styles.infoText, { color: tintColor }]}>
                  Your account will be reviewed by an administrator before access is granted.
                </ThemedText>
              </View>

              {/* Signup Button */}
              <TouchableOpacity
                style={[
                  styles.signupButton,
                  { backgroundColor: primaryButtonColor },
                  isLoading && styles.disabledButton
                ]}
                onPress={handleSignup}
                disabled={isLoading}
              >
                {isLoading ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color={primaryButtonTextColor} />
                    <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                      Creating Account...
                    </ThemedText>
                  </View>
                ) : (
                  <ThemedText style={[styles.buttonText, { color: primaryButtonTextColor }]}>
                    Create Account
                  </ThemedText>
                )}
              </TouchableOpacity>
            </View>
          </Card>

          {/* Login Link */}
          <View style={styles.loginContainer}>
            <ThemedText style={[styles.loginText, { color: mutedTextColor }]}>
              Already have an account?{' '}
            </ThemedText>
            <TouchableOpacity onPress={() => !isLoading && router.replace('/auth/login')}>
              <ThemedText style={[styles.loginLink, { color: tintColor }]}>
                Sign In
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
  passwordHint: {
    fontSize: Layout.fontSize.xs,
    fontFamily: 'Montserrat-Regular',
    marginTop: Layout.spacing.xs,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: Layout.spacing.md,
    borderRadius: Layout.borderRadius.md,
    marginBottom: Layout.spacing.lg,
    gap: Layout.spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Regular',
    lineHeight: Layout.fontSize.sm * 1.4,
  },
  signupButton: {
    height: 52,
    borderRadius: Layout.borderRadius.md,
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
  buttonText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginText: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Regular',
  },
  loginLink: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-SemiBold',
  },
});