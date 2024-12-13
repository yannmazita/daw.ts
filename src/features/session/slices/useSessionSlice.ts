// src/features/session/slices/useSessionSlice.ts

import { StateCreator } from "zustand";
import { SessionState, SessionActions } from "@/core/interfaces/session";
import { sessionManager } from "@/features/session/services/SessionManagerInstance";
import { LaunchQuantization } from "@/core/types/common";

export interface SessionSlice extends SessionState, SessionActions {}

export const createSessionSlice: StateCreator<
  SessionSlice,
  [],
  [],
  SessionSlice
> = () => {
  return {
    // Initial state from session manager
    ...sessionManager.state,

    createScene: (name: string): string => {
      try {
        return sessionManager.actions.createScene(name);
      } catch (error) {
        console.error("Error creating scene:", error);
        throw error;
      }
    },

    deleteScene: (id: string): void => {
      try {
        sessionManager.actions.deleteScene(id);
      } catch (error) {
        console.error("Error deleting scene:", error);
        throw error;
      }
    },

    launchScene: (id: string): void => {
      try {
        sessionManager.actions.launchScene(id);
      } catch (error) {
        console.error("Error launching scene:", error);
        throw error;
      }
    },

    stopScene: (id: string): void => {
      try {
        sessionManager.actions.stopScene(id);
      } catch (error) {
        console.error("Error stopping scene:", error);
        throw error;
      }
    },

    reorderScenes: (sceneIds: string[]): void => {
      try {
        sessionManager.actions.reorderScenes(sceneIds);
      } catch (error) {
        console.error("Error reordering scenes:", error);
        throw error;
      }
    },

    setGlobalQuantization: (value: LaunchQuantization): void => {
      try {
        sessionManager.actions.setGlobalQuantization(value);
      } catch (error) {
        console.error("Error setting global quantization:", error);
        throw error;
      }
    },

    setClipQuantization: (value: LaunchQuantization): void => {
      try {
        sessionManager.actions.setClipQuantization(value);
      } catch (error) {
        console.error("Error setting clip quantization:", error);
        throw error;
      }
    },
  };
};
