// src/features/session/slices/useSessionSlice.ts

import { StateCreator } from "zustand";
import {
  SessionState,
  SessionActions,
  SessionTrackState,
  ClipSlot,
  SceneState,
} from "@/core/interfaces/session";
import { sessionManager } from "@/features/session/services/sessionManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { LaunchQuantization, FollowActionConfig } from "@/core/types/common";
import { TransportSlice } from "@/common/slices/useTransportSlice";
import { MixerSlice } from "@/features/mixer/slices/useMixerSlice";
import { PatternSlice } from "@/features/patterns/slices/usePatternSlice";

export interface SessionSlice extends SessionState, SessionActions {}

export const createSessionSlice: StateCreator<
  SessionSlice & TransportSlice & MixerSlice & PatternSlice,
  [],
  [],
  SessionSlice
> = (set, get) => {
  return {
    // Initial state from session manager
    ...sessionManager.state,

    // Track Management
    createTrack: (name: string): string => {
      try {
        return sessionManager.actions.createTrack(name);
      } catch (error) {
        console.error("Error creating track:", error);
        throw error;
      }
    },

    deleteTrack: (id: string): void => {
      try {
        // Clean up associated mixer channel
        const track = sessionManager.actions.getTrack(id);
        if (track?.mixerChannelId) {
          mixerManager.actions.removeChannel(track.mixerChannelId);
        }

        sessionManager.actions.deleteTrack(id);
      } catch (error) {
        console.error("Error deleting track:", error);
        throw error;
      }
    },

    updateTrack: (id: string, updates: Partial<SessionTrackState>): void => {
      try {
        sessionManager.actions.updateTrack(id, updates);

        // Sync mixer channel settings if needed
        const track = sessionManager.actions.getTrack(id);
        if (track?.mixerChannelId) {
          // Update corresponding mixer channel properties
          if ("name" in updates) {
            mixerManager.actions.updateChannel(track.mixerChannelId, {
              name: updates.name,
            });
          }
        }
      } catch (error) {
        console.error("Error updating track:", error);
        throw error;
      }
    },

    moveTrack: (id: string, newIndex: number): void => {
      try {
        sessionManager.actions.moveTrack(id, newIndex);
      } catch (error) {
        console.error("Error moving track:", error);
        throw error;
      }
    },

    // Clip Management
    createClip: (
      trackId: string,
      slotIndex: number,
      patternId: string,
    ): string => {
      try {
        return sessionManager.actions.createClip(trackId, slotIndex, patternId);
      } catch (error) {
        console.error("Error creating clip:", error);
        throw error;
      }
    },

    deleteClip: (trackId: string, slotIndex: number): void => {
      try {
        sessionManager.actions.deleteClip(trackId, slotIndex);
      } catch (error) {
        console.error("Error deleting clip:", error);
        throw error;
      }
    },

    updateClip: (
      trackId: string,
      slotIndex: number,
      updates: Partial<ClipSlot>,
    ): void => {
      try {
        sessionManager.actions.updateClip(trackId, slotIndex, updates);
      } catch (error) {
        console.error("Error updating clip:", error);
        throw error;
      }
    },

    duplicateClip: (
      sourceTrackId: string,
      sourceSlotIndex: number,
      targetTrackId: string,
      targetSlotIndex: number,
    ): string => {
      try {
        return sessionManager.actions.duplicateClip(
          sourceTrackId,
          sourceSlotIndex,
          targetTrackId,
          targetSlotIndex,
        );
      } catch (error) {
        console.error("Error duplicating clip:", error);
        throw error;
      }
    },

    // Scene Management
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

    updateScene: (id: string, updates: Partial<SceneState>): void => {
      try {
        sessionManager.actions.updateScene(id, updates);
      } catch (error) {
        console.error("Error updating scene:", error);
        throw error;
      }
    },

    moveScene: (id: string, newIndex: number): void => {
      try {
        sessionManager.actions.moveScene(id, newIndex);
      } catch (error) {
        console.error("Error moving scene:", error);
        throw error;
      }
    },

    // Playback Control
    launchClip: (trackId: string, slotIndex: number): void => {
      try {
        sessionManager.actions.launchClip(trackId, slotIndex);
      } catch (error) {
        console.error("Error launching clip:", error);
        throw error;
      }
    },

    stopClip: (trackId: string, slotIndex: number): void => {
      try {
        sessionManager.actions.stopClip(trackId, slotIndex);
      } catch (error) {
        console.error("Error stopping clip:", error);
        throw error;
      }
    },

    launchScene: async (sceneIndex: number): Promise<void> => {
      try {
        await sessionManager.actions.launchScene(sceneIndex);
      } catch (error) {
        console.error("Error launching scene:", error);
        throw error;
      }
    },

    stopScene: (sceneIndex: number): void => {
      try {
        sessionManager.actions.stopScene(sceneIndex);
      } catch (error) {
        console.error("Error stopping scene:", error);
        throw error;
      }
    },

    stopAllClips: (): void => {
      try {
        sessionManager.actions.stopAllClips();
      } catch (error) {
        console.error("Error stopping all clips:", error);
        throw error;
      }
    },

    // Recording
    armTrack: (trackId: string, armed: boolean): void => {
      try {
        sessionManager.actions.armTrack(trackId, armed);
      } catch (error) {
        console.error("Error arming track:", error);
        throw error;
      }
    },

    setMonitoring: (trackId: string, mode: "in" | "auto" | "off"): void => {
      try {
        sessionManager.actions.setMonitoring(trackId, mode);
      } catch (error) {
        console.error("Error setting monitoring mode:", error);
        throw error;
      }
    },

    recordIntoSlot: (trackId: string, slotIndex: number): void => {
      try {
        sessionManager.actions.recordIntoSlot(trackId, slotIndex);
      } catch (error) {
        console.error("Error recording into slot:", error);
        throw error;
      }
    },

    // Selection and Focus
    setFocusedTrack: (trackId: string | undefined): void => {
      try {
        sessionManager.actions.setFocusedTrack(trackId);
      } catch (error) {
        console.error("Error setting focused track:", error);
        throw error;
      }
    },

    setFocusedClip: (clipId: string | undefined): void => {
      try {
        sessionManager.actions.setFocusedClip(clipId);
      } catch (error) {
        console.error("Error setting focused clip:", error);
        throw error;
      }
    },

    selectClip: (clipId: string, addToSelection?: boolean): void => {
      try {
        sessionManager.actions.selectClip(clipId, addToSelection);
      } catch (error) {
        console.error("Error selecting clip:", error);
        throw error;
      }
    },

    deselectClip: (clipId: string): void => {
      try {
        sessionManager.actions.deselectClip(clipId);
      } catch (error) {
        console.error("Error deselecting clip:", error);
        throw error;
      }
    },

    clearSelection: (): void => {
      try {
        sessionManager.actions.clearSelection();
      } catch (error) {
        console.error("Error clearing selection:", error);
        throw error;
      }
    },

    // Configuration
    setClipLaunchQuantization: (quantization: LaunchQuantization): void => {
      try {
        sessionManager.actions.setClipLaunchQuantization(quantization);
      } catch (error) {
        console.error("Error setting clip launch quantization:", error);
        throw error;
      }
    },

    setSceneFollowAction: (config: FollowActionConfig | undefined): void => {
      try {
        sessionManager.actions.setSceneFollowAction(config);
      } catch (error) {
        console.error("Error setting scene follow action:", error);
        throw error;
      }
    },

    // Utility
    getClipAt: (trackId: string, slotIndex: number) => {
      try {
        return sessionManager.actions.getClipAt(trackId, slotIndex);
      } catch (error) {
        console.error("Error getting clip:", error);
        throw error;
      }
    },

    getTrack: (id: string) => {
      try {
        return sessionManager.actions.getTrack(id);
      } catch (error) {
        console.error("Error getting track:", error);
        throw error;
      }
    },

    getScene: (id: string) => {
      try {
        return sessionManager.actions.getScene(id);
      } catch (error) {
        console.error("Error getting scene:", error);
        throw error;
      }
    },

    dispose: (): void => {
      try {
        sessionManager.actions.dispose();
      } catch (error) {
        console.error("Error disposing session:", error);
        throw error;
      }
    },
  };
};
