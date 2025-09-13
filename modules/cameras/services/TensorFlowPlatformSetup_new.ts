// labwatch-app/modules/cameras/services/TensorFlowPlatformSetup.ts

import * as tf from '@tensorflow/tfjs';
import { Platform } from 'react-native';

// Import platform adapters conditionally
if (Platform.OS === 'web') {
  // For web platform
  require('@tensorflow/tfjs-backend-cpu');
  require('@tensorflow/tfjs-backend-webgl');
} else {
  // For React Native
  require('@tensorflow/tfjs-react-native');
}

let platformInitialized = false;

export const initializeTensorFlowPlatform = async (): Promise<void> => {
  if (platformInitialized) {
    console.log('TensorFlow.js platform already initialized');
    return;
  }

  try {
    console.log('Setting up TensorFlow.js platform...');
    
    // Wait for platform to be ready
    await tf.ready();
    
    // Ensure we have a backend available
    const backend = tf.getBackend();
    if (!backend) {
      console.log('No backend found, setting CPU backend...');
      await tf.setBackend('cpu');
      await tf.ready();
    }
    
    console.log('TensorFlow.js backend:', tf.getBackend());
    console.log('TensorFlow.js version:', tf.version);
    
    // Safely check available backends
    try {
      const registry = tf.engine().registry;
      if (registry && registry.knownBackends) {
        const backends = registry.knownBackends;
        console.log('Available backends:', Object.keys(backends));
      } else {
        console.log('Registry or knownBackends not available');
      }
    } catch (error) {
      console.log('Could not get backends info:', error);
    }
    
    // Memory info
    try {
      const memInfo = tf.memory();
      console.log('TensorFlow.js memory:', memInfo);
    } catch (error) {
      console.log('Could not get memory info:', error);
    }
    
    platformInitialized = true;
    console.log('✅ TensorFlow.js platform initialized successfully');
    
  } catch (error) {
    console.error('❌ Failed to initialize TensorFlow.js platform:', error);
    throw new Error(`TensorFlow.js platform initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const isPlatformInitialized = (): boolean => {
  return platformInitialized;
};

export const getTensorFlowInfo = () => {
  if (!platformInitialized) {
    return null;
  }
  
  try {
    return {
      version: tf.version,
      backend: tf.getBackend(),
      memory: tf.memory(),
      numTensors: tf.memory().numTensors
    };
  } catch (error) {
    console.error('Error getting TensorFlow info:', error);
    return null;
  }
};
