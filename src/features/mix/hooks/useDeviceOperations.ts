// src/features/mix/hooks/useDeviceOperations.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { DeviceType } from "@/core/types/audio";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Device } from "../types";

export const useDeviceOperations = (trackId: string) => {
  const mixEngine = useMixEngine();
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const mixerTrack = mixerTracks[trackId];
  const deviceIds = mixerTrack?.deviceIds;

  const addDevice = useCallback(
    (deviceType: DeviceType) => {
      if (!mixerTrack) return;
      mixEngine.addDevice(trackId, deviceType);
    },
    [mixEngine, trackId, mixerTracks],
  );

  const updateDevice = useCallback(
    (deviceId: string, updates: Partial<Device>) => {
      mixEngine.updateDevice(trackId, deviceId, updates);
    },
    [mixEngine, trackId, mixerTracks],
  );

  const removeDevice = useCallback(
    (deviceId: string) => {
      mixEngine.removeDevice(trackId, deviceId);
    },
    [mixEngine, trackId, mixerTracks],
  );

  return {
    deviceIds,
    addDevice,
    updateDevice,
    removeDevice,
  };
};
