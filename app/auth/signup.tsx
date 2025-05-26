// app/auth/signup.tsx
import { Text as ThemedText } from '@/components/Themed';
import { app, auth } from '@/FirebaseConfig'; // Assuming app is exported for firestore initialization
import { useThemeColor } from '@/hooks/useThemeColor';
import { useRouter } from 'expo-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

const firestore = getFirestore(app);

export default function SignupScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState(''); // Added for user data

  const containerBackgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'inputBackground');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'borderColor');
  const placeholderTextColor = useThemeColor({}, 'inputPlaceholder');
  const buttonBackgroundColor = useThemeColor({}, 'tint');
  const titleColor = useThemeColor({}, 'text');
  const linkTextColor = useThemeColor({}, 'tint');

  const handleSignup = async () => {
    if (!email.trim() || !password.trim() || !fullName.trim()) {
      Alert.alert("Missing Information", "Please fill out all fields.");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user info in Firestore
      await setDoc(doc(firestore, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        fullName: fullName,
        role: "user", // Default role
        status: "pending", // Initial status, to be approved by admin
        createdAt: new Date(),
      });

      Alert.alert("Signup Successful", "Your account has been created and is awaiting admin approval.");
      router.replace('/auth/pending-approval'); // Changed to pending-approval
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
      console.error("Signup error:", error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedText style={[styles.title, { color: titleColor }]}>Create Account</ThemedText>
      <TextInput
        style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        placeholderTextColor={placeholderTextColor}
        autoCapitalize="words"
      />
      <TextInput
        style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor={placeholderTextColor}
      />
      <TextInput
        style={[styles.input, { backgroundColor: inputBackgroundColor, color: inputTextColor, borderColor: inputBorderColor }]}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor={placeholderTextColor}
      />
      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignup} color={buttonBackgroundColor} />
      </View>
      <ThemedText style={styles.loginText} onPress={() => router.replace('/auth/login')}>
        Already have an account? <ThemedText style={{ color: linkTextColor, fontWeight: 'bold' }}>Log In</ThemedText>
      </ThemedText>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  buttonContainer: {
    marginTop: 10,
    borderRadius: 8,
    overflow: 'hidden', // Ensures the button respects border radius on Android
  },
  loginText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});