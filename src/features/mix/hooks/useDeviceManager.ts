// src/features/mix/hooks/useDeviceManager.ts
import { useCallback } from "react";
import { useMixEngine } from "@/core/engines/EngineManager";
import { Device, DeviceType } from "../types";

export const useDeviceManager = (parentId: string | null) => {
  const mixEngine = useMixEngine();

  const addDevice = useCallback(
    (deviceType: DeviceType) => {
      if (!parentId) return;
      return mixEngine.addDevice(parentId, deviceType);
    },
    [mixEngine, parentId],
  );

  const updateDevice = useCallback(
    (deviceId: string, updates: Partial<Device>) => {
      if (!parentId) return;
      mixEngine.updateDevice(parentId, deviceId, updates);
    },
    [mixEngine, parentId],
  );

  const removeDevice = useCallback(
    (deviceId: string) => {
      if (!parentId) return;
      mixEngine.removeDevice(parentId, deviceId);
    },
    [mixEngine, parentId],
  );

  return {
    addDevice,
    updateDevice,
    removeDevice,
  };
};
