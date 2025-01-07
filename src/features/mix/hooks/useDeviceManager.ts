// src/features/mix/hooks/useDeviceManager.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { Device, DeviceType } from "../types";

export const useDeviceManager = (parentId: string | null) => {
  const compositionEngine = useCompositionEngine();

  const addDevice = useCallback(
    (deviceType: DeviceType) => {
      if (!parentId) return;
      return compositionEngine.addDevice(parentId, deviceType);
    },
    [compositionEngine, parentId],
  );

  const updateDevice = useCallback(
    (deviceId: string, updates: Partial<Device>) => {
      if (!parentId) return;
      compositionEngine.updateDevice(parentId, deviceId, updates);
    },
    [compositionEngine, parentId],
  );

  const removeDevice = useCallback(
    (deviceId: string) => {
      if (!parentId) return;
      compositionEngine.removeDevice(parentId, deviceId);
    },
    [compositionEngine, parentId],
  );

  return {
    addDevice,
    updateDevice,
    removeDevice,
  };
};
