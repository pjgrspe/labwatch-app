// labwatch-app/modules/cameras/components/RealAIPeopleDetectionDemo.tsx

import { Card, ThemedText, ThemedView } from '@/components';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRealPeopleDetection } from '../hooks/useRealPeopleDetection';
import PeopleCounter from './PeopleCounter';

interface RealAIPeopleDetectionDemoProps {
  cameraId: string;
  roomId: string;
}

export default function RealAIPeopleDetectionDemo({ 
  cameraId, 
  roomId 
}: RealAIPeopleDetectionDemoProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const {
    state,
    isInitialized,
    isDetecting,
    error,
    currentResult,
    peopleCount,
    detectedPersons,
    detectionHistory,
    recentEvents,
    stats,
    modelInfo,
    initialize,
    startDetection,
    stopDetection,
    toggleDetection,
    clearHistory,
    isPersonDetected
  } = useRealPeopleDetection({
    cameraId,
    roomId,
    config: {
      enabled: true,
      confidenceThreshold: 0.6,
      detectionInterval: 3000, // 3 seconds for demo
      trackingEnabled: true,
      saveDetectionEvents: true,
      alertOnCountChange: true
    },
    autoStart: false,
    enableBackground: false
  });

  // Show alerts for detection events
  useEffect(() => {
    if (recentEvents.length > 0) {
      const latestEvent = recentEvents[0];
      if (latestEvent.eventType === 'person_entered') {
        Alert.alert(
          'Person Detected!',
          `Someone entered the room. Current count: ${latestEvent.currentCount}`,
          [{ text: 'OK' }]
        );
      } else if (latestEvent.eventType === 'person_exited') {
        Alert.alert(
          'Person Left',
          `Someone left the room. Current count: ${latestEvent.currentCount}`,
          [{ text: 'OK' }]
        );
      }
    }
  }, [recentEvents]);

  const getStateColor = () => {
    switch (state) {
      case 'initializing': return colors.text;
      case 'detecting': return '#4CAF50';
      case 'error': return '#F44336';
      default: return colors.text;
    }
  };

  const getStateText = () => {
    switch (state) {
      case 'idle': return isInitialized ? 'Ready' : 'Not Initialized';
      case 'initializing': return 'Initializing AI Model...';
      case 'detecting': return 'AI Detection Active';
      case 'error': return 'Error';
      default: return 'Unknown';
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Card style={styles.card}>
        <ThemedText style={styles.title}>🤖 Real AI People Detection Demo</ThemedText>
        
        {/* Status Section */}
        <View style={styles.section}>
          <ThemedText style={styles.sectionTitle}>Status</ThemedText>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: getStateColor() }]} />
            <ThemedText style={styles.statusText}>{getStateText()}</ThemedText>
          </View>
          
          {error && (
            <View style={styles.errorContainer}>
              <ThemedText style={styles.errorText}>❌ {error}</ThemedText>
            </View>
          )}
        </View>

        {/* Model Information */}
        {modelInfo && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>AI Model</ThemedText>
            <ThemedText style={styles.infoText}>
              📊 {modelInfo.name} v{modelInfo.version}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              🎯 Classes: {modelInfo.supportedClasses.length} total
            </ThemedText>
            <ThemedText style={styles.infoText}>
              🟢 Status: {modelInfo.isLoaded ? 'Loaded' : 'Not Loaded'}
            </ThemedText>
          </View>
        )}

        {/* People Counter */}
        {isInitialized && (
          <View style={styles.section}>
          <PeopleCounter
            count={peopleCount}
            detectedPersons={detectedPersons}
            isActive={isDetecting}
            compact={false}
            style={styles.counter}
          />
          </View>
        )}

        {/* Current Detection Details */}
        {currentResult && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Current Detection</ThemedText>
            <View style={styles.detectionInfo}>
              <ThemedText style={styles.infoText}>
                👥 People: {currentResult.personCount}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                ⏱️ Processing: {currentResult.processingTime}ms
              </ThemedText>
              <ThemedText style={styles.infoText}>
                📐 Frame: {currentResult.frameWidth}x{currentResult.frameHeight}
              </ThemedText>
              <ThemedText style={styles.infoText}>
                🕒 Time: {currentResult.timestamp.toLocaleTimeString()}
              </ThemedText>
            </View>

            {/* Detected Persons Details */}
            {detectedPersons.length > 0 && (
              <View style={styles.personsContainer}>
                <ThemedText style={styles.personsTitle}>
                  Detected Persons ({detectedPersons.length}):
                </ThemedText>
                {detectedPersons.slice(0, 3).map((person, index) => (
                  <View key={person.id} style={styles.personItem}>
                    <ThemedText style={styles.personText}>
                      #{index + 1}: {(person.confidence * 100).toFixed(1)}% confidence
                    </ThemedText>
                    <ThemedText style={styles.personText}>
                      Position: ({Math.round(person.bbox[0])}, {Math.round(person.bbox[1])}) 
                      Size: {Math.round(person.bbox[2])}x{Math.round(person.bbox[3])}
                    </ThemedText>
                  </View>
                ))}
                {detectedPersons.length > 3 && (
                  <ThemedText style={styles.moreText}>
                    ... and {detectedPersons.length - 3} more
                  </ThemedText>
                )}
              </View>
            )}
          </View>
        )}

        {/* Statistics */}
        {stats && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Statistics</ThemedText>
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{stats.totalDetections}</ThemedText>
                <ThemedText style={styles.statLabel}>Total Detections</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{stats.averageCount.toFixed(1)}</ThemedText>
                <ThemedText style={styles.statLabel}>Avg Count</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>{stats.maxCount}</ThemedText>
                <ThemedText style={styles.statLabel}>Max Count</ThemedText>
              </View>
              <View style={styles.statItem}>
                <ThemedText style={styles.statValue}>
                  {(stats.detectionAccuracy * 100).toFixed(1)}%
                </ThemedText>
                <ThemedText style={styles.statLabel}>Accuracy</ThemedText>
              </View>
            </View>
          </View>
        )}

        {/* Recent Events */}
        {recentEvents.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>Recent Events</ThemedText>
            {recentEvents.slice(0, 5).map((event) => (
              <View key={event.id} style={styles.eventItem}>
                <View style={styles.eventHeader}>
                  <ThemedText style={styles.eventType}>
                    {event.eventType === 'person_entered' ? '➡️' : 
                     event.eventType === 'person_exited' ? '⬅️' : '🔄'}
                    {' '}
                    {event.eventType.replace('_', ' ').toUpperCase()}
                  </ThemedText>
                  <ThemedText style={styles.eventTime}>
                    {event.timestamp.toLocaleTimeString()}
                  </ThemedText>
                </View>
                <ThemedText style={styles.eventDetails}>
                  Count: {event.previousCount} → {event.currentCount}
                </ThemedText>
              </View>
            ))}
          </View>
        )}

        {/* Detection History Summary */}
        {detectionHistory.length > 0 && (
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>History</ThemedText>
            <ThemedText style={styles.infoText}>
              📊 {detectionHistory.length} detections recorded
            </ThemedText>
            <ThemedText style={styles.infoText}>
              🕒 Last: {detectionHistory[detectionHistory.length - 1]?.timestamp.toLocaleString()}
            </ThemedText>
          </View>
        )}

      </Card>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  card: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333',
  },
  section: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
  },
  infoText: {
    fontSize: 13,
    marginBottom: 4,
    color: '#666',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 6,
  },
  counter: {
    alignSelf: 'center',
  },
  detectionInfo: {
    backgroundColor: '#F5F5F5',
    padding: 12,
    borderRadius: 6,
    marginBottom: 12,
  },
  personsContainer: {
    backgroundColor: '#E8F5E8',
    padding: 12,
    borderRadius: 6,
  },
  personsTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#2E7D32',
  },
  personItem: {
    marginBottom: 6,
  },
  personText: {
    fontSize: 12,
    color: '#388E3C',
  },
  moreText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#666',
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statItem: {
    backgroundColor: '#F0F7FF',
    padding: 12,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1976D2',
  },
  statLabel: {
    fontSize: 10,
    color: '#666',
    marginTop: 2,
    textAlign: 'center',
  },
  eventItem: {
    backgroundColor: '#FFF3E0',
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  eventType: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#E65100',
  },
  eventTime: {
    fontSize: 10,
    color: '#666',
  },
  eventDetails: {
    fontSize: 11,
    color: '#BF360C',
  },
});
