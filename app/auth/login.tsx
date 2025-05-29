// app/auth/login.tsx
import { ThemedText } from '@/components';
import { app, auth } from '@/FirebaseConfig'; // Assuming app is exported
import { useThemeColor } from '@/hooks';
import { useRouter } from 'expo-router';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Button, KeyboardAvoidingView, Platform, StyleSheet, TextInput, View } from 'react-native';

const firestore = getFirestore(app);

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const containerBackgroundColor = useThemeColor({}, 'background');
  const inputBackgroundColor = useThemeColor({ light: '#FFFFFF', dark: '#2C2C2E' }, 'inputBackground');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorderColor = useThemeColor({}, 'borderColor');
  const placeholderTextColor = useThemeColor({}, 'inputPlaceholder');
  const buttonBackgroundColor = useThemeColor({}, 'tint');
  const titleColor = useThemeColor({}, 'text');
  const linkTextColor = useThemeColor({}, 'tint');
  const errorTextColor = useThemeColor({}, 'errorText');


  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing Information", "Please enter both email and password.");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check user status in Firestore
      const userDocRef = doc(firestore, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        if (userData.status === "pending") {
          Alert.alert("Account Pending", "Your account is awaiting admin approval.");
          await signOut(auth);
          setLoading(false);
        } else if (userData.status === "denied") { // This part handles the denied status
          Alert.alert("Account Denied", "Your account registration was denied. Please contact support or sign up again.");
          await signOut(auth);
          setLoading(false);
        } else if (userData.status === "approved") {
          router.replace('/');
        } else {
           Alert.alert("Login Error", "Account status is unknown. Please contact support.");
           await signOut(auth);
           setLoading(false);
        }
      } else {
        // This case should ideally not happen if signup always creates a user doc
        Alert.alert("Login Error", "User data not found. Please contact support.");
        await signOut(auth);
        setLoading(false);
      }
    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
      console.error("Login error:", error);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: containerBackgroundColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ThemedText style={[styles.title, { color: titleColor }]}>Welcome Back!</ThemedText>
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
      {loading ? (
        <ActivityIndicator size="large" color={buttonBackgroundColor} style={{ marginTop: 20 }}/>
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Log In" onPress={handleLogin} color={buttonBackgroundColor} />
        </View>
      )}
      <ThemedText style={styles.signupText} onPress={() => router.replace('/auth/signup')}>
        Don't have an account? <ThemedText style={{ color: linkTextColor, fontWeight: 'bold' }}>Sign Up</ThemedText>
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
    overflow: 'hidden',
  },
  signupText: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 16,
  },
});