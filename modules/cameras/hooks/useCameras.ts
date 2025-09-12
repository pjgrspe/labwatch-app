// labwatch-app/modules/cameras/hooks/useCameras.ts
import { CameraConfiguration } from '@/types/camera';
import { useCallback, useEffect, useState } from 'react';
import { CameraService } from '../services/CameraService';

export const useCameras = (roomId?: string) => {
  const [cameras, setCameras] = useState<CameraConfiguration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCameras = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const cameraData = roomId 
        ? await CameraService.getCamerasForRoom(roomId)
        : await CameraService.getAllCameras();
      
      setCameras(cameraData);
    } catch (err) {
      console.error('Error fetching cameras:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch cameras');
      setCameras([]);
    } finally {
      setIsLoading(false);
    }
  }, [roomId]);

  const testConnection = useCallback(async (cameraId: string) => {
    try {
      return await CameraService.testCameraConnection(cameraId);
    } catch (err) {
      console.error('Error testing camera connection:', err);
      return false;
    }
  }, []);

  const startRecording = useCallback(async (cameraId: string) => {
    try {
      await CameraService.startRecording(cameraId);
      // Refresh cameras to get updated status
      await fetchCameras();
    } catch (err) {
      console.error('Error starting recording:', err);
      throw err;
    }
  }, [fetchCameras]);

  const stopRecording = useCallback(async (cameraId: string) => {
    try {
      await CameraService.stopRecording(cameraId);
      // Refresh cameras to get updated status
      await fetchCameras();
    } catch (err) {
      console.error('Error stopping recording:', err);
      throw err;
    }
  }, [fetchCameras]);

  const toggleNightVision = useCallback(async (cameraId: string, enabled: boolean) => {
    try {
      await CameraService.toggleNightVision(cameraId, enabled);
      // Refresh cameras to get updated status
      await fetchCameras();
    } catch (err) {
      console.error('Error toggling night vision:', err);
      throw err;
    }
  }, [fetchCameras]);

  useEffect(() => {
    fetchCameras();
  }, [fetchCameras]);

  // Real-time subscription effect
  useEffect(() => {
    if (!roomId) return;

    const unsubscribe = CameraService.onCamerasUpdate(
      roomId,
      (updatedCameras) => {
        setCameras(updatedCameras);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Camera update error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return unsubscribe;
  }, [roomId]);

  return {
    cameras,
    isLoading,
    error,
    fetchCameras,
    testConnection,
    startRecording,
    stopRecording,
    toggleNightVision,
  };
};
