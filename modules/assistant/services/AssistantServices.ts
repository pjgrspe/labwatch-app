// labwatch-app/modules/assistant/services/AssistantService.ts
import { GEMINI_API_KEY } from '@/APIkeys'; //
import { ChatSession, GenerationConfig, GoogleGenerativeAI, HarmBlockThreshold, HarmCategory } from '@google/generative-ai';
import { RoomService } from '@/modules/rooms/services/RoomService';
import { AlertService } from '@/modules/alerts/services/AlertService';
import { getIncidents } from '@/utils/firebaseUtils';
import { Room, RoomSensorData } from '@/types/rooms';
import { Alert, AlertSeverity } from '@/types/alerts';
import { Incident } from '@/types/incidents';
import { AirQualityData, TempHumidityData, ThermalImagerData, VibrationData } from '@/types/sensor';

const MODEL_NAME = "gemini-2.0-flash"; // Or your preferred model

if (!GEMINI_API_KEY) {
  console.warn(
    'Gemini API Key not found. Please ensure it is set in labwatch-app/APIkeys.ts. The AI Assistant will not function correctly.'
  );
}

const genAI = GEMINI_API_KEY ? new GoogleGenerativeAI(GEMINI_API_KEY) : null;

// Define the system instruction for the Lab Safety and Monitoring Officer persona
const baseSystemInstruction = `You are a dedicated and expert Lab Safety and Monitoring Officer for LabWatch, a comprehensive laboratory monitoring system. Your sole responsibility is to provide information, guidance, suggestions, and directions strictly related to laboratory safety protocols, hazard identification, risk assessment, emergency procedures, safe use of lab equipment, and interpretation of monitoring data.

You have access to real-time data from the laboratory monitoring system including:
- Room status and sensor readings (temperature, humidity, air quality, thermal imaging, vibration)
- Active alerts and their severity levels
- Recent incidents and their resolution status
- Alert thresholds and monitoring parameters

Your responses must be:
- Focused exclusively on lab safety and monitoring.
- Clear, concise, and actionable.
- Based on established safety principles and best practices.
- Informed by the current system status when relevant.

When providing guidance, consider the current state of the laboratory systems and mention specific data points when they are relevant to safety concerns.

If a user asks a question or makes a request outside of this specific domain (e.g., general knowledge, casual conversation, topics unrelated to lab operations or safety), you must politely decline to answer. State that the query is outside your designated functions as a Lab Safety and Monitoring Officer and offer to assist with lab safety or monitoring questions instead.

Example of declining: "As the Lab Safety and Monitoring Officer, my expertise is focused on lab safety and monitoring. I can't help with that particular topic, but I'd be happy to answer any questions you have about lab safety procedures or monitoring data."

Maintain a professional and helpful tone befitting your role.`;

// System data interfaces
interface SystemContext {
  rooms: Room[];
  activeAlerts: Alert[];
  recentIncidents: Incident[];
  criticalSensors: Array<{
    roomName: string;
    sensorType: string;
    currentValue: string;
    status: string;
  }>;
  systemSummary: string;
}

// Data fetching and formatting utilities
const SystemDataService = {
  /**
   * Fetch all available system data for context
   */
  fetchSystemContext: async (): Promise<SystemContext> => {
    try {
      const [rooms, alerts, incidents] = await Promise.all([
        SystemDataService.fetchRooms(),
        SystemDataService.fetchActiveAlerts(),
        SystemDataService.fetchRecentIncidents()
      ]);

      const criticalSensors = await SystemDataService.analyzeCriticalSensors(rooms);
      const systemSummary = SystemDataService.generateSystemSummary(rooms, alerts, incidents, criticalSensors);

      return {
        rooms,
        activeAlerts: alerts,
        recentIncidents: incidents,
        criticalSensors,
        systemSummary
      };
    } catch (error) {
      console.error('Error fetching system context:', error);
      return {
        rooms: [],
        activeAlerts: [],
        recentIncidents: [],
        criticalSensors: [],
        systemSummary: 'System data temporarily unavailable.'
      };
    }
  },

  /**
   * Fetch all rooms with basic info
   */
  fetchRooms: async (): Promise<Room[]> => {
    return new Promise((resolve) => {
      const unsubscribe = RoomService.onRoomsUpdate(
        (rooms) => {
          unsubscribe();
          resolve(rooms);
        },
        (error) => {
          console.error('Error fetching rooms:', error);
          unsubscribe();
          resolve([]);
        }
      );
    });
  },

  /**
   * Fetch active alerts (unacknowledged and recent)
   */
  fetchActiveAlerts: async (): Promise<Alert[]> => {
    return new Promise((resolve) => {
      const unsubscribe = AlertService.onAlertsUpdate(
        (alerts) => {
          unsubscribe();
          // Filter for active/unacknowledged alerts or recent critical ones
          const activeAlerts = alerts.filter(alert => 
            !alert.acknowledged || 
            (alert.severity === 'critical' && 
             alert.timestamp && 
             new Date().getTime() - new Date(alert.timestamp).getTime() < 3600000) // Last hour
          );
          resolve(activeAlerts.slice(0, 20)); // Limit to prevent context overflow
        },
        (error) => {
          console.error('Error fetching alerts:', error);
          unsubscribe();
          resolve([]);
        }
      );
    });
  },

  /**
   * Fetch recent incidents
   */
  fetchRecentIncidents: async (): Promise<Incident[]> => {
    try {
      const incidents = await getIncidents();
      // Return last 10 incidents, prioritizing open/in_progress
      const sortedIncidents = incidents
        .sort((a, b) => {
          // Prioritize open/in_progress status
          const statusPriority = { 'open': 3, 'in_progress': 2, 'resolved': 1, 'closed': 0 };
          const aPriority = statusPriority[a.status] || 0;
          const bPriority = statusPriority[b.status] || 0;
          
          if (aPriority !== bPriority) return bPriority - aPriority;
          
          // Then by date
          return new Date(b.reportedAt).getTime() - new Date(a.reportedAt).getTime();
        })
        .slice(0, 10);
      
      return sortedIncidents;
    } catch (error) {
      console.error('Error fetching incidents:', error);
      return [];
    }
  },

  /**
   * Analyze sensors and identify critical conditions
   */
  analyzeCriticalSensors: async (rooms: Room[]): Promise<Array<{
    roomName: string;
    sensorType: string;
    currentValue: string;
    status: string;
  }>> => {
    const criticalSensors: Array<{
      roomName: string;
      sensorType: string;
      currentValue: string;
      status: string;
    }> = [];

    for (const room of rooms) {
      if (!room.isMonitored) continue;
      
      try {
        const sensorData = await new Promise<RoomSensorData | null>((resolve) => {
          const unsubscribe = RoomService.onRoomSensorsUpdate(
            room.id,
            (sensors) => {
              unsubscribe();
              resolve(sensors);
            },
            (error) => {
              console.error(`Error fetching sensors for room ${room.id}:`, error);
              unsubscribe();
              resolve(null);
            }
          );
        });

        if (sensorData) {
          // Analyze each sensor type
          if (sensorData.tempHumidity) {
            const status = SystemDataService.evaluateTemperatureHumidity(sensorData.tempHumidity);
            if (status !== 'normal') {
              criticalSensors.push({
                roomName: room.name,
                sensorType: 'Temperature/Humidity',
                currentValue: `${sensorData.tempHumidity.temperature?.toFixed(1)}°C, ${sensorData.tempHumidity.humidity?.toFixed(1)}%`,
                status
              });
            }
          }

          if (sensorData.airQuality) {
            const status = SystemDataService.evaluateAirQuality(sensorData.airQuality);
            if (status !== 'normal') {
              criticalSensors.push({
                roomName: room.name,
                sensorType: 'Air Quality',
                currentValue: `PM2.5: ${sensorData.airQuality.pm25?.toFixed(1)} µg/m³, PM10: ${sensorData.airQuality.pm10?.toFixed(1)} µg/m³`,
                status
              });
            }
          }          if (sensorData.thermalImager) {
            const status = SystemDataService.evaluateThermalImaging(sensorData.thermalImager);
            if (status !== 'normal') {
              criticalSensors.push({
                roomName: room.name,
                sensorType: 'Thermal Imaging',
                currentValue: `Avg: ${sensorData.thermalImager.avgTemp?.toFixed(1)}°C, Max: ${sensorData.thermalImager.maxTemp?.toFixed(1)}°C`,
                status
              });
            }
          }

          if (sensorData.vibration) {
            const status = SystemDataService.evaluateVibration(sensorData.vibration);
            if (status !== 'normal') {
              criticalSensors.push({
                roomName: room.name,
                sensorType: 'Vibration',
                currentValue: `${sensorData.vibration.rmsAcceleration?.toFixed(2)} m/s²`,
                status
              });
            }
          }
        }
      } catch (error) {
        console.error(`Error analyzing sensors for room ${room.name}:`, error);
      }
    }

    return criticalSensors;
  },

  /**
   * Evaluate temperature and humidity levels
   */
  evaluateTemperatureHumidity: (data: TempHumidityData): string => {
    const temp = data.temperature ?? 0;
    const humidity = data.humidity ?? 0;

    if (temp >= 35 || temp <= 5) return 'critical';
    if (temp >= 30 || temp <= 10) return 'high';
    if (humidity >= 80 || humidity <= 20) return 'high';
    if (humidity >= 70) return 'medium';
    
    return 'normal';
  },

  /**
   * Evaluate air quality levels
   */
  evaluateAirQuality: (data: AirQualityData): string => {
    const pm25 = data.pm25 ?? 0;
    const pm10 = data.pm10 ?? 0;

    if (pm25 >= 150.5 || pm10 >= 425) return 'critical';
    if (pm25 >= 55.5 || pm10 >= 255) return 'high';
    if (pm25 >= 35.5 || pm10 >= 155) return 'medium';
    
    return 'normal';
  },
  /**
   * Evaluate thermal imaging data
   */
  evaluateThermalImaging: (data: ThermalImagerData): string => {
    const avgTemp = data.avgTemp ?? 0;
    const maxTemp = data.maxTemp ?? 0;

    if (avgTemp >= 60 || maxTemp >= 70) return 'critical';
    if (avgTemp >= 50 || maxTemp >= 60) return 'high';
    
    return 'normal';
  },

  /**
   * Evaluate vibration levels
   */
  evaluateVibration: (data: VibrationData): string => {
    const rmsAccel = data.rmsAcceleration ?? 0;

    if (rmsAccel >= 5.0) return 'critical';
    if (rmsAccel >= 2.0) return 'high';
    
    return 'normal';
  },

  /**
   * Generate a comprehensive system summary
   */
  generateSystemSummary: (
    rooms: Room[], 
    alerts: Alert[], 
    incidents: Incident[], 
    criticalSensors: Array<{roomName: string; sensorType: string; currentValue: string; status: string}>
  ): string => {
    const monitoredRooms = rooms.filter(r => r.isMonitored);
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    const highAlerts = alerts.filter(a => a.severity === 'high');
    const openIncidents = incidents.filter(i => i.status === 'open' || i.status === 'in_progress');

    let summary = `LABWATCH SYSTEM STATUS SUMMARY:\n\n`;
    summary += `📊 MONITORING OVERVIEW:\n`;
    summary += `• Total Rooms: ${rooms.length} (${monitoredRooms.length} monitored)\n`;
    summary += `• Active Alerts: ${alerts.length} (${criticalAlerts.length} critical, ${highAlerts.length} high)\n`;
    summary += `• Open Incidents: ${openIncidents.length}\n`;
    summary += `• Critical Sensors: ${criticalSensors.filter(s => s.status === 'critical').length}\n\n`;

    if (criticalAlerts.length > 0) {
      summary += `🚨 CRITICAL ALERTS:\n`;
      criticalAlerts.slice(0, 5).forEach(alert => {
        summary += `• ${alert.roomName}: ${alert.message} (${alert.type})\n`;
      });
      summary += `\n`;
    }

    if (criticalSensors.length > 0) {
      summary += `⚠️ SENSORS REQUIRING ATTENTION:\n`;
      criticalSensors.slice(0, 5).forEach(sensor => {
        summary += `• ${sensor.roomName} - ${sensor.sensorType}: ${sensor.currentValue} (${sensor.status})\n`;
      });
      summary += `\n`;
    }

    if (openIncidents.length > 0) {
      summary += `📋 OPEN INCIDENTS:\n`;
      openIncidents.slice(0, 3).forEach(incident => {
        summary += `• ${incident.title} (${incident.roomName || 'Unknown Room'}) - ${incident.severity} - ${incident.status}\n`;
      });
      summary += `\n`;
    }

    if (criticalAlerts.length === 0 && criticalSensors.length === 0 && openIncidents.length === 0) {
      summary += `✅ SYSTEM STATUS: All monitored parameters are within normal ranges.\n\n`;
    }

    summary += `Use this information to provide context-aware safety guidance and recommendations.`;

    return summary;
  },

  /**
   * Format context for AI prompt inclusion
   */
  formatContextForAI: (context: SystemContext): string => {
    return `\n\n=== CURRENT SYSTEM STATUS ===\n${context.systemSummary}\n\nThis data is current as of ${new Date().toISOString()}.\n========================\n\n`;
  }
};

// Initialize model with base instruction (context will be added per message)
const model = genAI 
  ? genAI.getGenerativeModel({ 
      model: MODEL_NAME, 
      systemInstruction: baseSystemInstruction 
    }) 
  : null;

const generationConfig: GenerationConfig = {
  temperature: 0.3, // Lowered for more factual and less creative responses
  topK: 1,          // topK=1 also makes it more deterministic
  topP: 1,          // topP can also be lowered (e.g. 0.9) for more focused output
  maxOutputTokens: 2048,
};

const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
];

export const AssistantService = {
  /**
   * Send message with full system context awareness
   */
  sendMessage: async (
    chatHistory: { role: string; parts: { text: string }[] }[],
    newMessageText: string
  ): Promise<string> => {
    if (!model) {
      return "AI Model is not initialized. Check API Key or system instruction setup.";
    }

    try {
      // Fetch current system context
      const systemContext = await SystemDataService.fetchSystemContext();
      const contextualPrompt = SystemDataService.formatContextForAI(systemContext);
      
      // Prepend context to the user's message
      const enhancedMessage = contextualPrompt + newMessageText;

      // The systemInstruction is part of the model initialization,
      // so it will be applied to this chat session.
      const chat: ChatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory, 
      });

      const result = await chat.sendMessage(enhancedMessage);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      if (error.message && error.message.includes('API key not valid')) {
        return "AI API key is not valid. Please check your configuration in APIkeys.ts.";
      }
      if (error.message && error.message.includes('FETCH_ERROR')) {
        return "Network error. Could not connect to AI service. Please check your internet connection.";
      }
      // Check for content filtering or other specific errors
      if (error.message && error.message.toLowerCase().includes('finishreason: 4')){ // FINISH_REASON_SAFETY
         return "I am unable to provide a response to that query due to safety guidelines. Please ask about lab safety and monitoring."
      }
      if (error.message && error.message.toLowerCase().includes('finishreason: 3')){ // FINISH_REASON_RECITATION
         return "My apologies, I cannot fulfill that request as it may violate content policies. Please ask about lab safety and monitoring."
      }
      return `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again or ask a different lab safety question.`;
    }
  },

  /**
   * Send message without system context (for faster responses when context isn't needed)
   */
  sendMessageWithoutContext: async (
    chatHistory: { role: string; parts: { text: string }[] }[],
    newMessageText: string
  ): Promise<string> => {
    if (!model) {
      return "AI Model is not initialized. Check API Key or system instruction setup.";
    }

    try {
      const chat: ChatSession = model.startChat({
        generationConfig,
        safetySettings,
        history: chatHistory, 
      });

      const result = await chat.sendMessage(newMessageText);
      const response = result.response;
      return response.text();
    } catch (error: any) {
      console.error('Error sending message to AI:', error);
      if (error.message && error.message.includes('API key not valid')) {
        return "AI API key is not valid. Please check your configuration in APIkeys.ts.";
      }
      if (error.message && error.message.includes('FETCH_ERROR')) {
        return "Network error. Could not connect to AI service. Please check your internet connection.";
      }
      if (error.message && error.message.toLowerCase().includes('finishreason: 4')){ 
         return "I am unable to provide a response to that query due to safety guidelines. Please ask about lab safety and monitoring."
      }
      if (error.message && error.message.toLowerCase().includes('finishreason: 3')){ 
         return "My apologies, I cannot fulfill that request as it may violate content policies. Please ask about lab safety and monitoring."
      }
      return `Sorry, I encountered an error: ${error.message || 'Unknown error'}. Please try again or ask a different lab safety question.`;
    }
  },

  /**
   * Get current system status summary for display
   */
  getSystemStatus: async (): Promise<SystemContext> => {
    return await SystemDataService.fetchSystemContext();
  },

  /**
   * Get specific room analysis and recommendations
   */
  analyzeRoom: async (roomId: string): Promise<string> => {
    if (!model) {
      return "AI Model is not initialized. Check API Key or system instruction setup.";
    }

    try {
      // Fetch specific room data
      const rooms = await SystemDataService.fetchRooms();
      const room = rooms.find(r => r.id === roomId);
      
      if (!room) {
        return "Room not found in the system.";
      }

      // Get room sensor data
      const sensorData = await new Promise<RoomSensorData | null>((resolve) => {
        const unsubscribe = RoomService.onRoomSensorsUpdate(
          roomId,
          (sensors) => {
            unsubscribe();
            resolve(sensors);
          },
          (error) => {
            console.error(`Error fetching sensors for room ${roomId}:`, error);
            unsubscribe();
            resolve(null);
          }
        );
      });

      // Get room-specific alerts
      const allAlerts = await SystemDataService.fetchActiveAlerts();
      const roomAlerts = allAlerts.filter(alert => alert.roomId === roomId);

      // Generate analysis prompt
      let analysisPrompt = `Please provide a detailed safety analysis for ${room.name} (${room.location}).\n\n`;
      
      if (sensorData) {
        analysisPrompt += `Current sensor readings:\n`;
        if (sensorData.tempHumidity) {
          analysisPrompt += `• Temperature: ${sensorData.tempHumidity.temperature?.toFixed(1)}°C\n`;
          analysisPrompt += `• Humidity: ${sensorData.tempHumidity.humidity?.toFixed(1)}%\n`;
        }
        if (sensorData.airQuality) {
          analysisPrompt += `• PM2.5: ${sensorData.airQuality.pm25?.toFixed(1)} µg/m³\n`;
          analysisPrompt += `• PM10: ${sensorData.airQuality.pm10?.toFixed(1)} µg/m³\n`;
        }        if (sensorData.thermalImager) {
          analysisPrompt += `• Thermal average: ${sensorData.thermalImager.avgTemp?.toFixed(1)}°C\n`;
          analysisPrompt += `• Thermal max: ${sensorData.thermalImager.maxTemp?.toFixed(1)}°C\n`;
        }
        if (sensorData.vibration) {
          analysisPrompt += `• Vibration: ${sensorData.vibration.rmsAcceleration?.toFixed(2)} m/s²\n`;
        }
      }

      if (roomAlerts.length > 0) {
        analysisPrompt += `\nActive alerts for this room:\n`;
        roomAlerts.forEach(alert => {
          analysisPrompt += `• ${alert.message} (${alert.severity})\n`;
        });
      }

      analysisPrompt += `\nPlease assess the current conditions and provide specific safety recommendations.`;

      const chat: ChatSession = model.startChat({
        generationConfig,
        safetySettings,
      });

      const result = await chat.sendMessage(analysisPrompt);
      return result.response.text();

    } catch (error: any) {
      console.error('Error analyzing room:', error);
      return `Sorry, I encountered an error analyzing the room: ${error.message || 'Unknown error'}`;
    }
  },

  /**
   * Utility methods for external access to system data
   */
  SystemData: SystemDataService
};