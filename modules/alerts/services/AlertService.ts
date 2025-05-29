// labwatch-app/modules/alerts/services/AlertService.ts
import { db } from '@/FirebaseConfig';
import { AuthService } from '@/modules/auth/services/AuthService'; // ADDED AuthService
import { Alert, AlertSeverity, AlertType } from '@/types/alerts';
import { RoomSensorData } from '@/types/rooms';
import {
  AirQualityData,
  TempHumidityData,
  ThermalImagerData,
  VibrationData,
} from '@/types/sensor';
import { convertTimestamps } from '@/utils/firebaseUtils';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
  updateDoc,
  where
} from 'firebase/firestore';

export const ALERTS_COLLECTION = 'alerts';

// --- Alert Thresholds and Definitions ---
const ALERT_THRESHOLDS = {
  TEMPERATURE_CRITICAL_HIGH: 35,
  TEMPERATURE_HIGH: 30,
  TEMPERATURE_CRITICAL_LOW: 5,
  TEMPERATURE_LOW: 10,
  HUMIDITY_CRITICAL_HIGH: 80,
  HUMIDITY_HIGH: 70,
  HUMIDITY_LOW: 20,
  PM25_CRITICAL: 150.5,
  PM25_HIGH: 55.5,
  PM25_MEDIUM: 35.5,
  PM10_CRITICAL: 425,
  PM10_HIGH: 255,
  PM10_MEDIUM: 155,
  THERMAL_CRITICAL_AVG: 60,
  THERMAL_HIGH_AVG: 50,
  THERMAL_CRITICAL_MAX_PIXEL: 70,
  THERMAL_HIGH_MAX_PIXEL: 60,
  VIBRATION_CRITICAL: 5.0,
  VIBRATION_HIGH: 2.0,
};

const createAlertMessage = (
  roomName: string,
  sensorName: string,
  condition: string,
  value: string | number
): string => {
  return `${condition} detected in ${roomName} (${sensorName}): ${value}.`;
};

// Helper to process alerts and fetch user names
const processAlertsWithUserNames = async (alerts: Alert[]): Promise<Alert[]> => {
  const processedAlerts = await Promise.all(
    alerts.map(async (alert) => {
      if (alert.acknowledged && alert.acknowledgedBy) {
        const userProfile = await AuthService.getUserProfile(alert.acknowledgedBy);
        return { ...alert, acknowledgedByName: userProfile?.fullName || alert.acknowledgedBy };
      }
      return alert;
    })
  );
  return processedAlerts;
};


export const AlertService = {
  generateAlert: async (
    alertData: Omit<Alert, 'id' | 'timestamp' | 'acknowledged' | 'acknowledgedAt' | 'acknowledgedBy' | 'acknowledgedByName'> // MODIFIED
  ): Promise<string> => {
    const cleanedAlertData: any = {
      roomId: alertData.roomId,
      roomName: alertData.roomName,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      timestamp: serverTimestamp(),
      acknowledged: false,
    };

    // Add optional fields only if they exist and are valid
    if (alertData.sensorId && alertData.sensorId.trim() !== '') {
      cleanedAlertData.sensorId = alertData.sensorId;
    }
    if (alertData.sensorType && alertData.sensorType.trim() !== '') {
      cleanedAlertData.sensorType = alertData.sensorType;
    }
    if (alertData.triggeringValue !== undefined && alertData.triggeringValue !== null) {
      cleanedAlertData.triggeringValue = alertData.triggeringValue;
    }
    if (alertData.details && alertData.details.trim() !== '') {
      cleanedAlertData.details = alertData.details;
    }

    // FIXED: Better duplicate check that handles missing sensorId
    const q = query(
        collection(db, ALERTS_COLLECTION),
        where('roomId', '==', alertData.roomId),
        where('type', '==', alertData.type),
        where('severity', '==', alertData.severity),
        where('acknowledged', '==', false),
        orderBy('timestamp', 'desc'),
        limit(1)
    );

    try {
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const mostRecentExistingAlert = querySnapshot.docs[0].data();
            // Check if this is the same sensor (if sensorId exists)
            const sameSource = !alertData.sensorId || 
                             mostRecentExistingAlert.sensorId === alertData.sensorId;
            
            if (sameSource && mostRecentExistingAlert.timestamp && mostRecentExistingAlert.timestamp.toDate) {
                const timeDiffMs = Date.now() - mostRecentExistingAlert.timestamp.toDate().getTime();
                if (timeDiffMs < 30000) {
                    console.warn(`[AlertService.generateAlert] Suppressed duplicate alert generation for sensor ${alertData.sensorId}, type ${alertData.type}. Existing alert was ${timeDiffMs / 1000}s old.`);
                    return querySnapshot.docs[0].id;
                }
            }
        }

        const alertCollectionRef = collection(db, ALERTS_COLLECTION);
        console.log('[AlertService.generateAlert] Creating alert with data:', JSON.stringify(cleanedAlertData, null, 2));
        const docRef = await addDoc(alertCollectionRef, cleanedAlertData);
        console.log(`Alert generated: ${alertData.type} for room ${alertData.roomName} (ID: ${docRef.id})`);
        return docRef.id;
    } catch (error: any) {
        console.error('[AlertService.generateAlert] Error in generateAlert:', error.message);
        console.error('Alert data that failed:', JSON.stringify(cleanedAlertData, null, 2));
        throw error;
    }
  },

  checkForAlerts: async (
    roomId: string,
    roomName: string,
    sensorId: string,
    sensorType: keyof RoomSensorData,
    currentData: any
  ): Promise<void> => {
    if (!currentData || !currentData.name) {
      console.warn(`[AlertService.checkForAlerts] Missing data or name for sensor ${sensorId} in room ${roomId} (${roomName})`);
      return;
    }
    if (!roomName || roomName.trim() === "") {
      console.error(`[AlertService.checkForAlerts] Invalid roomName (empty or null) for roomId: ${roomId}. Cannot generate alert.`);
      return;
    }
    const sensorDisplayName = currentData.name || 'Unknown Sensor';

    const existingAlertQuery = query(
      collection(db, ALERTS_COLLECTION),
      where('roomId', '==', roomId),
      where('sensorId', '==', sensorId),
      where('acknowledged', '==', false)
    );
    const existingAlertsSnapshot = await getDocs(existingAlertQuery);

    switch (sensorType) {
      case 'tempHumidity':
        const thData = currentData as TempHumidityData;
        let tempAlertType: AlertType | null = null;
        let tempAlertSeverity: AlertSeverity | null = null;
        let tempAlertMessage: string | null = null;
        let tempTriggeringValue: string | number | undefined = undefined;

        if (thData.temperature >= ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_HIGH) {
          tempAlertType = 'high_temperature'; tempAlertSeverity = 'critical';
          tempAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Critical high temperature', `${thData.temperature}°C`);
          tempTriggeringValue = `${thData.temperature}°C`;
        } else if (thData.temperature >= ALERT_THRESHOLDS.TEMPERATURE_HIGH) {
          tempAlertType = 'high_temperature'; tempAlertSeverity = 'high';
          tempAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'High temperature', `${thData.temperature}°C`);
          tempTriggeringValue = `${thData.temperature}°C`;
        } else if (thData.temperature <= ALERT_THRESHOLDS.TEMPERATURE_CRITICAL_LOW) {
          tempAlertType = 'low_temperature'; tempAlertSeverity = 'critical';
           tempAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Critical low temperature', `${thData.temperature}°C`);
           tempTriggeringValue = `${thData.temperature}°C`;
        } else if (thData.temperature <= ALERT_THRESHOLDS.TEMPERATURE_LOW) {
          tempAlertType = 'low_temperature'; tempAlertSeverity = 'high';
          tempAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Low temperature', `${thData.temperature}°C`);
          tempTriggeringValue = `${thData.temperature}°C`;
        }

        const unacknowledgedTempAlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === tempAlertType && doc.data().severity === tempAlertSeverity && doc.data().sensorId === sensorId);

        if (tempAlertType && tempAlertSeverity && tempAlertMessage && tempAlertMessage.trim() !== "" && !unacknowledgedTempAlertExists) {
          await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: tempAlertType, severity: tempAlertSeverity, message: tempAlertMessage, triggeringValue: tempTriggeringValue });
        }

        let humAlertType: AlertType | null = null;
        let humAlertSeverity: AlertSeverity | null = null;
        let humAlertMessage: string | null = null;
        let humTriggeringValue: string | number | undefined = undefined;

        if (thData.humidity >= ALERT_THRESHOLDS.HUMIDITY_CRITICAL_HIGH) {
            humAlertType = 'high_humidity'; humAlertSeverity = 'critical';
            humAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Critical high humidity', `${thData.humidity}%`);
            humTriggeringValue = `${thData.humidity}%`;
        } else if (thData.humidity >= ALERT_THRESHOLDS.HUMIDITY_HIGH) {
            humAlertType = 'high_humidity'; humAlertSeverity = 'high';
            humAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'High humidity', `${thData.humidity}%`);
            humTriggeringValue = `${thData.humidity}%`;
        } else if (thData.humidity <= ALERT_THRESHOLDS.HUMIDITY_LOW) {
            humAlertType = 'low_humidity'; humAlertSeverity = 'medium';
            humAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Low humidity', `${thData.humidity}%`);
            humTriggeringValue = `${thData.humidity}%`;
        }
        const unacknowledgedHumAlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === humAlertType && doc.data().severity === humAlertSeverity && doc.data().sensorId === sensorId);

        if (humAlertType && humAlertSeverity && humAlertMessage && humAlertMessage.trim() !== "" && !unacknowledgedHumAlertExists) {
            await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: humAlertType, severity: humAlertSeverity, message: humAlertMessage, triggeringValue: humTriggeringValue });
        }
        break;

      case 'airQuality':
        const aqData = currentData as AirQualityData;
        let aqAlertTypePm25: AlertType | null = null;
        let aqAlertSeverityPm25: AlertSeverity | null = null;
        let aqAlertMessagePm25: string | null = null;
        let aqTriggeringValuePm25: string | number | undefined = undefined;

        if (aqData.pm25 >= ALERT_THRESHOLDS.PM25_CRITICAL) {
            aqAlertTypePm25 = 'poor_air_quality_pm25'; aqAlertSeverityPm25 = 'critical';
            aqAlertMessagePm25 = createAlertMessage(roomName, sensorDisplayName, 'Critical PM2.5 level', `${aqData.pm25} µg/m³`);
            aqTriggeringValuePm25 = `PM2.5: ${aqData.pm25} µg/m³`;
        } else if (aqData.pm25 >= ALERT_THRESHOLDS.PM25_HIGH) {
            aqAlertTypePm25 = 'poor_air_quality_pm25'; aqAlertSeverityPm25 = 'high';
            aqAlertMessagePm25 = createAlertMessage(roomName, sensorDisplayName, 'High PM2.5 level', `${aqData.pm25} µg/m³`);
            aqTriggeringValuePm25 = `PM2.5: ${aqData.pm25} µg/m³`;
        } else if (aqData.pm25 >= ALERT_THRESHOLDS.PM25_MEDIUM) {
            aqAlertTypePm25 = 'poor_air_quality_pm25'; aqAlertSeverityPm25 = 'medium';
            aqAlertMessagePm25 = createAlertMessage(roomName, sensorDisplayName, 'Moderate PM2.5 level (sensitive groups)', `${aqData.pm25} µg/m³`);
            aqTriggeringValuePm25 = `PM2.5: ${aqData.pm25} µg/m³`;
        }
        const unackPM25AlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === aqAlertTypePm25 && doc.data().severity === aqAlertSeverityPm25 && doc.data().sensorId === sensorId);
         if (aqAlertTypePm25 && aqAlertSeverityPm25 && aqAlertMessagePm25 && aqAlertMessagePm25.trim() !== "" && !unackPM25AlertExists) {
          await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: aqAlertTypePm25, severity: aqAlertSeverityPm25, message: aqAlertMessagePm25, triggeringValue: aqTriggeringValuePm25 });
        }

        let aqAlertTypePm10: AlertType | null = null;
        let aqAlertSeverityPm10: AlertSeverity | null = null;
        let aqAlertMessagePm10: string | null = null;
        let aqTriggeringValuePm10: string | number | undefined = undefined;

         if (aqData.pm10 >= ALERT_THRESHOLDS.PM10_CRITICAL) {
            aqAlertTypePm10 = 'poor_air_quality_pm10'; aqAlertSeverityPm10 = 'critical';
            aqAlertMessagePm10 = createAlertMessage(roomName, sensorDisplayName, 'Critical PM10 level', `${aqData.pm10} µg/m³`);
            aqTriggeringValuePm10 = `PM10: ${aqData.pm10} µg/m³`;
        } else if (aqData.pm10 >= ALERT_THRESHOLDS.PM10_HIGH) {
            aqAlertTypePm10 = 'poor_air_quality_pm10'; aqAlertSeverityPm10 = 'high';
            aqAlertMessagePm10 = createAlertMessage(roomName, sensorDisplayName, 'High PM10 level', `${aqData.pm10} µg/m³`);
            aqTriggeringValuePm10 = `PM10: ${aqData.pm10} µg/m³`;
        } else if (aqData.pm10 >= ALERT_THRESHOLDS.PM10_MEDIUM) {
            aqAlertTypePm10 = 'poor_air_quality_pm10'; aqAlertSeverityPm10 = 'medium';
            aqAlertMessagePm10 = createAlertMessage(roomName, sensorDisplayName, 'Moderate PM10 level (sensitive groups)', `${aqData.pm10} µg/m³`);
            aqTriggeringValuePm10 = `PM10: ${aqData.pm10} µg/m³`;
        }
        const unackPM10AlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === aqAlertTypePm10 && doc.data().severity === aqAlertSeverityPm10 && doc.data().sensorId === sensorId);

        if (aqAlertTypePm10 && aqAlertSeverityPm10 && aqAlertMessagePm10 && aqAlertMessagePm10.trim() !== "" && !unackPM10AlertExists) {
          await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: aqAlertTypePm10, severity: aqAlertSeverityPm10, message: aqAlertMessagePm10, triggeringValue: aqTriggeringValuePm10 });
        }
        break;

      case 'thermalImager':
        const tiData = currentData as ThermalImagerData;
        let tiAlertType: AlertType | null = null;
        let tiAlertSeverity: AlertSeverity | null = null;
        let tiAlertMessage: string | null = null;
        let tiTriggeringValue: string | number | undefined = undefined;

        if (tiData.maxTemp >= ALERT_THRESHOLDS.THERMAL_CRITICAL_MAX_PIXEL || tiData.avgTemp >= ALERT_THRESHOLDS.THERMAL_CRITICAL_AVG) {
            tiAlertType = 'thermal_anomaly'; tiAlertSeverity = 'critical';
            tiAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Critical thermal anomaly', `Max: ${tiData.maxTemp}°C, Avg: ${tiData.avgTemp}°C`);
            tiTriggeringValue = `Max: ${tiData.maxTemp}°C, Avg: ${tiData.avgTemp}°C`;
        } else if (tiData.maxTemp >= ALERT_THRESHOLDS.THERMAL_HIGH_MAX_PIXEL || tiData.avgTemp >= ALERT_THRESHOLDS.THERMAL_HIGH_AVG) {
            tiAlertType = 'thermal_anomaly'; tiAlertSeverity = 'high';
            tiAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'High thermal anomaly', `Max: ${tiData.maxTemp}°C, Avg: ${tiData.avgTemp}°C`);
            tiTriggeringValue = `Max: ${tiData.maxTemp}°C, Avg: ${tiData.avgTemp}°C`;
        }

        const unackThermalAlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === tiAlertType && doc.data().severity === tiAlertSeverity && doc.data().sensorId === sensorId);
        if (tiAlertType && tiAlertSeverity && tiAlertMessage && tiAlertMessage.trim() !== "" && !unackThermalAlertExists) {
          await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: tiAlertType, severity: tiAlertSeverity, message: tiAlertMessage, triggeringValue: tiTriggeringValue });
        }
        break;

      case 'vibration':
        const vibData = currentData as VibrationData;
        let vibAlertType: AlertType | null = null;
        let vibAlertSeverity: AlertSeverity | null = null;
        let vibAlertMessage: string | null = null;
        let vibTriggeringValue: string | number | undefined = undefined;

        if (vibData.rmsAcceleration >= ALERT_THRESHOLDS.VIBRATION_CRITICAL) {
            vibAlertType = 'high_vibration'; vibAlertSeverity = 'critical';
            vibAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'Critical vibration detected', `${vibData.rmsAcceleration}g`);
            vibTriggeringValue = `${vibData.rmsAcceleration}g`;
        } else if (vibData.rmsAcceleration >= ALERT_THRESHOLDS.VIBRATION_HIGH) {
            vibAlertType = 'high_vibration'; vibAlertSeverity = 'high';
            vibAlertMessage = createAlertMessage(roomName, sensorDisplayName, 'High vibration detected', `${vibData.rmsAcceleration}g`);
            vibTriggeringValue = `${vibData.rmsAcceleration}g`;
        }
        const unackVibAlertExists = existingAlertsSnapshot.docs.some(doc => doc.data().type === vibAlertType && doc.data().severity === vibAlertSeverity && doc.data().sensorId === sensorId);
        if (vibAlertType && vibAlertSeverity && vibAlertMessage && vibAlertMessage.trim() !== "" && !unackVibAlertExists) {
          await AlertService.generateAlert({ roomId, roomName, sensorId, sensorType, type: vibAlertType, severity: vibAlertSeverity, message: vibAlertMessage, triggeringValue: vibTriggeringValue });
        }
        break;

      default:
        // console.log(`checkForAlerts: No specific alert logic for sensor type ${sensorType}`);
    }
  },

  getAlerts: async (roomId?: string): Promise<Alert[]> => {
    try {
      const alertsCollectionRef = collection(db, ALERTS_COLLECTION);
      let q;
      if (roomId) {
        q = query(
          alertsCollectionRef,
          where('roomId', '==', roomId),
          orderBy('timestamp', 'desc')
        );
      } else {
        q = query(alertsCollectionRef, orderBy('timestamp', 'desc'));
      }
      const querySnapshot = await getDocs(q);
      const alerts = querySnapshot.docs.map(
        (doc) => convertTimestamps({ id: doc.id, ...doc.data() }) as Alert
      );
      return processAlertsWithUserNames(alerts); // MODIFIED
    } catch (error) {
      console.error('Error fetching alerts:', error);
      throw error;
    }
  },

  onAlertsUpdate: (
    onNext: (alerts: Alert[]) => void,
    onError?: (error: Error) => void,
    roomId?: string
  ): Unsubscribe => {
    const alertsCollectionRef = collection(db, ALERTS_COLLECTION);
    let q;
    if (roomId) {
      q = query(alertsCollectionRef, where('roomId', '==', roomId), orderBy('timestamp', 'desc'));
    } else {
      q = query(alertsCollectionRef, orderBy('timestamp', 'desc'));
    }

    return onSnapshot(q,
      async (querySnapshot) => { // MODIFIED to be async
        let alerts = querySnapshot.docs.map(doc =>
          convertTimestamps({ id: doc.id, ...doc.data() }) as Alert
        );
        alerts = await processAlertsWithUserNames(alerts); // MODIFIED
        onNext(alerts);
      },
      (error) => {
        console.error("[AlertService.onAlertsUpdate] Error listening to alert updates:", error);
        if (onError) {
          onError(error);
        }
      }
    );
  },

  getAlertById: async (alertId: string): Promise<Alert | null> => {
    try {
      const alertDocRef = doc(db, ALERTS_COLLECTION, alertId);
      const docSnap = await getDoc(alertDocRef);
      if (docSnap.exists()) {
        let alert = convertTimestamps({ id: docSnap.id, ...docSnap.data() }) as Alert;
        // MODIFICATION START
        if (alert.acknowledged && alert.acknowledgedBy) {
          const userProfile = await AuthService.getUserProfile(alert.acknowledgedBy);
          alert.acknowledgedByName = userProfile?.fullName || alert.acknowledgedBy;
        }
        // MODIFICATION END
        return alert;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching alert ${alertId}:`, error);
      throw error;
    }
  },

  acknowledgeAlert: async (alertId: string, userId: string): Promise<void> => {
    console.log(`[AlertService.acknowledgeAlert] User ${userId} attempting to acknowledge alert ${alertId}`);
    try {
      const alertDocRef = doc(db, ALERTS_COLLECTION, alertId);
      await updateDoc(alertDocRef, {
        acknowledged: true,
        acknowledgedAt: serverTimestamp(),
        acknowledgedBy: userId,
      });
      console.log('Alert acknowledged:', alertId);
    } catch (error: any) {
      console.error(`[AlertService.acknowledgeAlert] Error acknowledging alert ${alertId} by user ${userId}. Code:`, error.code, 'Message:', error.message);
      throw error;
    }
  },

  createSystemNotification: async (
    message: string,
    severity: AlertSeverity = 'info',
    roomId?: string,
    roomName?: string
  ): Promise<string> => {
    if (!message || message.trim() === "") {
      console.error("[AlertService.createSystemNotification] Cannot create notification with empty message.");
      throw new Error("Notification message cannot be empty.");
    }
    const effectiveRoomId = roomId || 'system';
    const effectiveRoomName = roomName || 'System-Wide';

    if (effectiveRoomId.trim() === "" || effectiveRoomName.trim() === "") {
       console.error("[AlertService.createSystemNotification] Invalid roomId or roomName provided for system notification.");
      throw new Error("roomId and roomName for system notification cannot be empty.");
    }

    return AlertService.generateAlert({
      roomId: effectiveRoomId,
      roomName: effectiveRoomName,
      type: 'test_alert',
      severity,
      message,
      // FIXED: Don't include undefined sensorId/sensorType for system notifications
    });
  },
};