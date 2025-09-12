// modules/cameras/hooks/useCameraConnectionStatus.ts
import { CameraConfiguration } from '@/types/camera';
import { useState } from 'react';

export interface CameraConnectionStatus {
  databaseStatus: 'connected' | 'disconnected' | 'testing';
  effectiveStatus: 'connected' | 'disconnected' | 'testing';
  isVideoPlaying: boolean;
}

/**
 * Hook to manage smart camera connection status that considers both database status and actual video playback
 */
export const useCameraConnectionStatus = (
  camera: CameraConfiguration,
  enableVideoCheck: boolean = false
): CameraConnectionStatus => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const databaseStatus = camera.connectionStatus || 'disconnected';
  
  // Smart connection status: if video is playing successfully, consider it connected
  const effectiveStatus = enableVideoCheck && isVideoPlaying ? 'connected' : databaseStatus;

  return {
    databaseStatus,
    effectiveStatus,
    isVideoPlaying,
    // Expose methods to update video status from components
    setVideoPlaying: setIsVideoPlaying,
  } as CameraConnectionStatus & { setVideoPlaying: (playing: boolean) => void };
};
