// app/modals/edit-camera.tsx
import { AppButton, AppInput, ThemedText, ThemedView } from '@/components';
import { Layout } from '@/constants';
import { useThemeColor } from '@/hooks';
import { CameraService } from '@/modules/cameras/services/CameraService';
import { CameraConfiguration } from '@/types/camera';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function EditCameraModal() {
  const router = useRouter();
  const { cameraId } = useLocalSearchParams<{ cameraId: string }>();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(true);
  const [cameraData, setCameraData] = useState<Partial<CameraConfiguration>>({});

  const containerBackgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const errorColor = useThemeColor({}, 'errorText');

  useEffect(() => {
    loadCamera();
  }, [cameraId]);

  const loadCamera = async () => {
    if (!cameraId) return;
    
    try {
      const camera = await CameraService.getCameraById(cameraId);
      if (camera) {
        setCameraData(camera);
      }
    } catch (error) {
      console.error('Error loading camera:', error);
      Alert.alert('Error', 'Failed to load camera data.');
    } finally {
      setIsLoadingCamera(false);
    }
  };

  const updateCameraData = (field: string, value: any) => {
    if (field.startsWith('credentials.')) {
      const credField = field.split('.')[1];
      setCameraData(prev => ({
        ...prev,
        credentials: {
          ...prev.credentials!,
          [credField]: value,
        },
      }));
    } else {
      setCameraData(prev => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const validateForm = (): string | null => {
    if (!cameraData.name?.trim()) {
      return 'Camera name is required';
    }
    if (!cameraData.credentials?.ipAddress?.trim()) {
      return 'IP address is required';
    }
    if (!cameraData.credentials?.username?.trim()) {
      return 'Username is required';
    }
    if (!cameraData.credentials?.password?.trim()) {
      return 'Password is required';
    }
    
    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!ipRegex.test(cameraData.credentials.ipAddress)) {
      return 'Please enter a valid IP address';
    }

    return null;
  };

  const handleUpdateCamera = async () => {
    if (!cameraId) return;
    
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      await CameraService.updateCamera(cameraId, cameraData as Partial<CameraConfiguration>);
      Alert.alert('Success', 'Camera updated successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      console.error('Error updating camera:', error);
      Alert.alert('Error', 'Failed to update camera. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async () => {
    if (!cameraId) return;
    
    const validationError = validateForm();
    if (validationError) {
      Alert.alert('Validation Error', validationError);
      return;
    }

    setIsLoading(true);
    try {
      const isConnected = await CameraService.testCameraConnection(cameraId);
      Alert.alert(
        'Connection Test',
        isConnected ? 'Camera connected successfully!' : 'Failed to connect to camera. Please check your settings.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error testing connection:', error);
      Alert.alert('Error', 'Failed to test connection. Please check your settings.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCamera = () => {
    Alert.alert(
      'Delete Camera',
      'Are you sure you want to delete this camera? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            if (!cameraId) return;
            
            try {
              await CameraService.deleteCamera(cameraId);
              Alert.alert('Success', 'Camera deleted successfully!', [
                { text: 'OK', onPress: () => router.back() }
              ]);
            } catch (error) {
              console.error('Error deleting camera:', error);
              Alert.alert('Error', 'Failed to delete camera. Please try again.');
            }
          }
        }
      ]
    );
  };

  const cameraModels = [
    'Tapo C200',
    'Tapo C210',
    'Tapo C220',
    'Tapo C310',
    'Tapo C320WS',
    'Other Tapo Model',
  ];

  if (isLoadingCamera) {
    return (
      <>
        <Stack.Screen 
          options={{ 
            title: 'Edit Camera',
            headerLeft: () => (
              <TouchableOpacity onPress={() => router.back()}>
                <Ionicons name="close" size={24} color={tintColor} />
              </TouchableOpacity>
            ),
          }} 
        />
        <ThemedView style={[styles.loadingContainer, { backgroundColor: containerBackgroundColor }]}>
          <ActivityIndicator size="large" color={tintColor} />
          <ThemedText style={[styles.loadingText, { color: textColor }]}>
            Loading camera data...
          </ThemedText>
        </ThemedView>
      </>
    );
  }

  return (
    <>
      <Stack.Screen 
        options={{ 
          title: 'Edit Camera',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="close" size={24} color={tintColor} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity onPress={handleDeleteCamera}>
              <Ionicons name="trash" size={24} color={errorColor} />
            </TouchableOpacity>
          ),
        }} 
      />
      <ScrollView
        style={[styles.container, { backgroundColor: containerBackgroundColor }]}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Camera Information
          </ThemedText>
          
          <AppInput
            label="Camera Name"
            placeholder="e.g., Living Room Camera"
            value={cameraData.name}
            onChangeText={(value: string) => updateCameraData('name', value)}
            required
          />

          <View style={styles.inputGroup}>
            <ThemedText style={[styles.label, { color: textColor }]}>
              Camera Model
            </ThemedText>
            <View style={styles.modelSelector}>
              {cameraModels.map((model) => (
                <TouchableOpacity
                  key={model}
                  style={[
                    styles.modelOption,
                    {
                      backgroundColor: cameraData.model === model ? tintColor + '15' : 'transparent',
                      borderColor: cameraData.model === model ? tintColor : '#E0E0E0',
                    }
                  ]}
                  onPress={() => updateCameraData('model', model)}
                >
                  <ThemedText style={[
                    styles.modelText,
                    { color: cameraData.model === model ? tintColor : textColor }
                  ]}>
                    {model}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Network Configuration
          </ThemedText>
          
          <AppInput
            label="IP Address"
            placeholder="192.168.1.100"
            value={cameraData.credentials?.ipAddress}
            onChangeText={(value: string) => updateCameraData('credentials.ipAddress', value)}
            keyboardType="numeric"
            required
          />

          <AppInput
            label="Port"
            placeholder="554"
            value={cameraData.credentials?.port?.toString()}
            onChangeText={(value: string) => updateCameraData('credentials.port', parseInt(value) || 554)}
            keyboardType="numeric"
          />

          <AppInput
            label="Username"
            placeholder="Camera username"
            value={cameraData.credentials?.username}
            onChangeText={(value: string) => updateCameraData('credentials.username', value)}
            autoCapitalize="none"
            required
          />

          <AppInput
            label="Password"
            placeholder="Camera password"
            value={cameraData.credentials?.password}
            onChangeText={(value: string) => updateCameraData('credentials.password', value)}
            secureTextEntry
            autoCapitalize="none"
            required
          />
        </ThemedView>

        <ThemedView style={styles.section}>
          <ThemedText style={[styles.sectionTitle, { color: textColor }]}>
            Camera Settings
          </ThemedText>

          <View style={styles.settingItem}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Motion Detection
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: cameraData.motionDetectionEnabled ? tintColor : '#E0E0E0' }
              ]}
              onPress={() => updateCameraData('motionDetectionEnabled', !cameraData.motionDetectionEnabled)}
            >
              <View style={[
                styles.toggleThumb,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: cameraData.motionDetectionEnabled ? 24 : 4 }],
                }
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Night Vision
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: cameraData.nightVisionEnabled ? tintColor : '#E0E0E0' }
              ]}
              onPress={() => updateCameraData('nightVisionEnabled', !cameraData.nightVisionEnabled)}
            >
              <View style={[
                styles.toggleThumb,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: cameraData.nightVisionEnabled ? 24 : 4 }],
                }
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Audio Recording
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: cameraData.audioRecordingEnabled ? tintColor : '#E0E0E0' }
              ]}
              onPress={() => updateCameraData('audioRecordingEnabled', !cameraData.audioRecordingEnabled)}
            >
              <View style={[
                styles.toggleThumb,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: cameraData.audioRecordingEnabled ? 24 : 4 }],
                }
              ]} />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <ThemedText style={[styles.settingLabel, { color: textColor }]}>
              Camera Active
            </ThemedText>
            <TouchableOpacity
              style={[
                styles.toggle,
                { backgroundColor: cameraData.isActive ? tintColor : '#E0E0E0' }
              ]}
              onPress={() => updateCameraData('isActive', !cameraData.isActive)}
            >
              <View style={[
                styles.toggleThumb,
                {
                  backgroundColor: '#FFFFFF',
                  transform: [{ translateX: cameraData.isActive ? 24 : 4 }],
                }
              ]} />
            </TouchableOpacity>
          </View>
        </ThemedView>

        <ThemedView style={styles.buttonContainer}>
          <AppButton
            title="Test Connection"
            onPress={handleTestConnection}
            variant="outline"
            disabled={isLoading}
            style={styles.testButton}
          />
          
          <AppButton
            title={isLoading ? 'Updating Camera...' : 'Update Camera'}
            onPress={handleUpdateCamera}
            disabled={isLoading}
            leftIcon={isLoading ? undefined : 'save'}
            style={styles.updateButton}
          >
            {isLoading && <ActivityIndicator size="small" color="#FFFFFF" />}
          </AppButton>
        </ThemedView>
      </ScrollView>
    </>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Layout.spacing.lg,
  },
  loadingText: {
    marginTop: Layout.spacing.md,
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
  },
  section: {
    marginBottom: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  sectionTitle: {
    fontSize: Layout.fontSize.lg,
    fontFamily: 'Montserrat-SemiBold',
    marginBottom: Layout.spacing.md,
  },
  inputGroup: {
    marginBottom: Layout.spacing.md,
  },
  label: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
    marginBottom: Layout.spacing.xs,
  },
  modelSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Layout.spacing.xs,
  },
  modelOption: {
    paddingHorizontal: Layout.spacing.md,
    paddingVertical: Layout.spacing.sm,
    borderWidth: 1,
    borderRadius: Layout.borderRadius.pill,
    marginBottom: Layout.spacing.xs,
  },
  modelText: {
    fontSize: Layout.fontSize.sm,
    fontFamily: 'Montserrat-Medium',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Layout.spacing.md,
  },
  settingLabel: {
    fontSize: Layout.fontSize.md,
    fontFamily: 'Montserrat-Medium',
    flex: 1,
  },
  toggle: {
    width: 52,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    position: 'relative',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    position: 'absolute',
  },
  buttonContainer: {
    gap: Layout.spacing.md,
    marginTop: Layout.spacing.lg,
    backgroundColor: 'transparent',
  },
  testButton: {
    marginBottom: Layout.spacing.sm,
  },
  updateButton: {
    marginBottom: Layout.spacing.xl,
  },
});
