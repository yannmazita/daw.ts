// src/features/sequencer/hooks/useSequencerPlayback.ts

import { useCallback, useEffect, useRef } from "react";
import * as Tone from "tone";
import { useSequencerStore } from "../slices/useSequencerStore";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { SequenceStatus } from "@/core/enums";
import { PlaybackMode } from "@/core/interfaces/sequencer";
import { usePlaybackController } from "./playback/usePlaybackController";

const DEFAULT_CONFIG = {
  scheduleAheadTime: 0.1, // 100ms ahead
  updateInterval: 1000 / 60, // 60fps
  latencyHint: "interactive" as AudioContextLatencyCategory,
} as const;

export const useSequencerPlayback = () => {
  // Refs for cleanup and state tracking
  const initializationAttempted = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  // Get essential state using individual selectors to minimize re-renders
  const status = useSequencerStore((state) => state.playback.status);
  const playbackMode = useSequencerStore((state) => state.playback.mode);
  const currentPatternId = usePatternStore((state) => state.currentPatternId);

  // Initialize playback controller with default config
  const {
    startPlayback,
    stopPlayback,
    pausePlayback,
    switchPlaybackMode,
    seekToPosition,
    isTransitioning,
  } = usePlaybackController(DEFAULT_CONFIG);

  // Initialize audio context safely
  const initializeAudioContext = useCallback(async () => {
    if (initializationAttempted.current) return;

    try {
      initializationAttempted.current = true;

      if (Tone.getContext().state !== "running") {
        await Tone.start();
        Tone.getContext().latencyHint = DEFAULT_CONFIG.latencyHint;
        console.log("Audio context initialized successfully");
      }

      return true;
    } catch (error) {
      console.error("Failed to initialize audio context:", error);
      return false;
    }
  }, []);

  // Validate playback state
  const validatePlaybackState = useCallback(() => {
    if (playbackMode === PlaybackMode.PATTERN && !currentPatternId) {
      console.warn("No pattern selected for playback");
      return false;
    }
    return true;
  }, [playbackMode, currentPatternId]);

  // Start sequencer with safety checks
  const startSequencer = useCallback(async () => {
    if (status === SequenceStatus.Playing) return;

    try {
      const contextInitialized = await initializeAudioContext();
      if (!contextInitialized) {
        throw new Error("Audio context initialization failed");
      }

      if (!validatePlaybackState()) {
        throw new Error("Invalid playback state");
      }

      await startPlayback();
    } catch (error) {
      console.error("Error starting sequencer:", error);
      stopSequencer();
    }
  }, [status, initializeAudioContext, validatePlaybackState, startPlayback]);

  // Stop sequencer with cleanup
  const stopSequencer = useCallback(() => {
    try {
      stopPlayback();
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    } catch (error) {
      console.error("Error stopping sequencer:", error);
    }
  }, [stopPlayback]);

  // Pause sequencer
  const pauseSequencer = useCallback(() => {
    try {
      pausePlayback();
    } catch (error) {
      console.error("Error pausing sequencer:", error);
    }
  }, [pausePlayback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
      stopPlayback();
    };
  }, [stopPlayback]);

  return {
    startSequencer,
    stopSequencer,
    pauseSequencer,
    switchPlaybackMode,
    seekToPosition,
    status,
    isTransitioning,
    isInitialized: initializationAttempted.current,
  };
};
