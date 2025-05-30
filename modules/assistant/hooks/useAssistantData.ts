// labwatch-app/modules/assistant/hooks/useAssistantData.ts
import { useState, useEffect, useCallback } from 'react';
import { AssistantService } from '../services/AssistantServices';
import { Room } from '@/types/rooms';
import { Alert } from '@/types/alerts';
import { Incident } from '@/types/incidents';

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

interface UseAssistantDataReturn {
  systemStatus: SystemContext | null;
  isLoadingStatus: boolean;
  refreshSystemStatus: () => Promise<void>;
  analyzeRoom: (roomId: string) => Promise<string>;
  isAnalyzingRoom: boolean;
  error: string | null;
}

export const useAssistantData = (): UseAssistantDataReturn => {
  const [systemStatus, setSystemStatus] = useState<SystemContext | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);
  const [isAnalyzingRoom, setIsAnalyzingRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshSystemStatus = useCallback(async () => {
    setIsLoadingStatus(true);
    setError(null);
    
    try {
      const status = await AssistantService.getSystemStatus();
      setSystemStatus(status);
    } catch (err: any) {
      console.error('Error fetching system status:', err);
      setError(err.message || 'Failed to fetch system status');
    } finally {
      setIsLoadingStatus(false);
    }
  }, []);

  const analyzeRoom = useCallback(async (roomId: string): Promise<string> => {
    setIsAnalyzingRoom(true);
    setError(null);

    try {
      const analysis = await AssistantService.analyzeRoom(roomId);
      return analysis;
    } catch (err: any) {
      console.error('Error analyzing room:', err);
      const errorMessage = err.message || 'Failed to analyze room';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsAnalyzingRoom(false);
    }
  }, []);

  // Auto-refresh system status on mount
  useEffect(() => {
    refreshSystemStatus();
  }, [refreshSystemStatus]);

  return {
    systemStatus,
    isLoadingStatus,
    refreshSystemStatus,
    analyzeRoom,
    isAnalyzingRoom,
    error
  };
};
