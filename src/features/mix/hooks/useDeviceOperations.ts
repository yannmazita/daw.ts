// src/features/mix/hooks/useDeviceOperations.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { DeviceType } from "@/core/types/audio";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Device } from "../types";
import { useTrackState } from "@/features/composition/hooks/useTrackState";

export const useDeviceOperations = (parentId: string) => {
  const mixEngine = useMixEngine();
  const trackState = useTrackState(parentId);
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const soundChains = useEngineStore((state) => state.mix.soundChains);
  const mixerTrack = mixerTracks[trackState?.id ?? ""];
  const soundChain = soundChains[parentId];

  const deviceIds = mixerTrack?.deviceIds ?? soundChain?.deviceIds ?? [];

  const addDevice = useCallback(
    (deviceType: DeviceType) => {
      return mixEngine.addDevice(parentId, deviceType);
    },
    [mixEngine, parentId],
  );

  const updateDevice = useCallback(
    (deviceId: string, updates: Partial<Device>) => {
      mixEngine.updateDevice(parentId, deviceId, updates);
    },
    [mixEngine, parentId],
  );

  const removeDevice = useCallback(
    (deviceId: string) => {
      mixEngine.removeDevice(parentId, deviceId);
    },
    [mixEngine, parentId],
  );

  return {
    deviceIds,
    addDevice,
    updateDevice,
    removeDevice,
  };
};
