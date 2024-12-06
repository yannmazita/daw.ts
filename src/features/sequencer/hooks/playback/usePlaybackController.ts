// src/features/sequencer/hooks/playback/usePlaybackController.ts

import { useCallback, useRef, useEffect } from "react";
import * as Tone from "tone";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { usePatternStore } from "@/features/patterns/slices/usePatternStore";
import { usePlaylistStore } from "@/features/playlists/slices/usePlaylistStore";
import { useEventScheduler } from "./useEventScheduler";
import { useTimingController } from "./useTimingController";
import { PlaybackMode } from "@/core/interfaces/sequencer";
import { SequenceStatus } from "@/core/enums";
import { PlaybackContext, PlaybackControllerConfig } from "./types";
import { useMixerStore } from "@/features/mixer/slices/useMixerStore";

export const usePlaybackController = (config: PlaybackControllerConfig) => {
  // State tracking refs
  const modeTransitionPending = useRef(false);
  const schedulerCleanupRef = useRef<(() => void) | null>(null);
  const currentMode = useRef<PlaybackMode>(PlaybackMode.PATTERN);

  // Get stores and controllers
  const { scheduleNextEvents, clearScheduledEvents } =
    useEventScheduler(config);
  const { startTimingLoop, stopTimingLoop } = useTimingController();

  const setStatus = useSequencerStore((state) => state.setStatus);
  const setPlaybackMode = useSequencerStore((state) => state.setPlaybackMode);
  const transport = useSequencerStore((state) => state.transport);

  // Configure transport settings
  const configureTransport = useCallback(() => {
    const transportInstance = Tone.getTransport();
    transportInstance.bpm.value = transport.bpm;
    transportInstance.timeSignature = transport.timeSignature;
    transportInstance.swing = transport.swing;
    transportInstance.swingSubdivision = transport.swingSubdivision;
  }, [transport]);

  // Initialize pattern mode playback
  const initializePatternMode = useCallback(() => {
    const currentPatternId = usePatternStore.getState().currentPatternId;
    const pattern = usePatternStore
      .getState()
      .patterns.find((p) => p.id === currentPatternId);

    if (!pattern) {
      throw new Error("No pattern selected for playback");
    }

    // Ensure mixer channels exist for all tracks
    pattern.tracks.forEach((track) => {
      const mixerStore = useMixerStore.getState();
      const channelExists = mixerStore.channels.some(
        (ch) => ch.id === track.id,
      );

      if (!channelExists) {
        mixerStore.addChannel({
          name: track.name,
          volume: 0,
          pan: 0,
          mute: track.muted,
          solo: track.solo,
          effects: [],
          sends: [],
        });
      }
    });

    return {
      mode: PlaybackMode.PATTERN,
      pattern,
    };
  }, []);

  // Initialize playlist mode playback
  const initializePlaylistMode = useCallback(() => {
    const playlist = usePlaylistStore.getState();
    if (!playlist.hasPatterns()) {
      throw new Error("No patterns in playlist");
    }

    return {
      mode: PlaybackMode.PLAYLIST,
      length: playlist.getLength(),
    };
  }, []);

  // Start playback with mode handling
  const startPlayback = useCallback(() => {
    try {
      configureTransport();

      // Initialize based on current mode
      const modeData =
        currentMode.current === PlaybackMode.PATTERN
          ? initializePatternMode()
          : initializePlaylistMode();

      // Create properly typed playback context
      const playbackContext: PlaybackContext = {
        currentTime: Tone.getTransport().seconds,
        scheduleAheadTime: config.scheduleAheadTime,
        pattern:
          currentMode.current === PlaybackMode.PATTERN
            ? modeData.pattern
            : null,
        mode: modeData.mode,
        status: SequenceStatus.Playing,
        bpm: transport.bpm,
        loopEnabled: useSequencerStore.getState().playback.loopEnabled,
        loopStart: useSequencerStore.getState().playback.loopStart,
        loopEnd: useSequencerStore.getState().playback.loopEnd,
      };

      // Start timing and scheduling with properly typed context
      const cleanup = startTimingLoop(() => {
        scheduleNextEvents(playbackContext);
      }, playbackContext);

      schedulerCleanupRef.current = cleanup;
      Tone.getTransport().start();
      setStatus(SequenceStatus.Playing);
    } catch (error) {
      console.error("Error starting playback:", error);
      stopPlayback();
      throw error;
    }
  }, [
    configureTransport,
    initializePatternMode,
    initializePlaylistMode,
    startTimingLoop,
    scheduleNextEvents,
    config.scheduleAheadTime,
    transport.bpm,
    setStatus,
  ]);

  // Stop playback with cleanup
  const stopPlayback = useCallback(() => {
    Tone.getTransport().stop();
    clearScheduledEvents();

    if (schedulerCleanupRef.current) {
      schedulerCleanupRef.current();
      schedulerCleanupRef.current = null;
    }

    // Clean up any temporary mixer channels
    if (currentMode.current === PlaybackMode.PATTERN) {
      const pattern = usePatternStore
        .getState()
        .patterns.find(
          (p) => p.id === usePatternStore.getState().currentPatternId,
        );

      if (pattern) {
        pattern.tracks.forEach((track) => {
          // Only remove temporary channels
          if (track.id.startsWith("temp_")) {
            useMixerStore.getState().removeChannel(track.id);
          }
        });
      }
    }

    stopTimingLoop();
    setStatus(SequenceStatus.Stopped);
  }, [clearScheduledEvents, stopTimingLoop, setStatus]);

  // Pause playback
  const pausePlayback = useCallback(() => {
    Tone.getTransport().pause();
    stopTimingLoop();
    setStatus(SequenceStatus.Paused);
  }, [stopTimingLoop, setStatus]);

  // Switch between playback modes
  const switchPlaybackMode = useCallback(
    (mode: PlaybackMode) => {
      if (modeTransitionPending.current || currentMode.current === mode) {
        return;
      }

      modeTransitionPending.current = true;
      const wasPlaying = Tone.getTransport().state === "started";

      try {
        // Stop current playback
        stopPlayback();

        // Update mode
        currentMode.current = mode;
        setPlaybackMode(mode);

        // Resume playback if it was playing
        if (wasPlaying) {
          startPlayback();
        }
      } catch (error) {
        console.error("Error switching playback mode:", error);
        throw error;
      } finally {
        modeTransitionPending.current = false;
      }
    },
    [stopPlayback, setPlaybackMode, startPlayback],
  );

  // Position seeking
  const seekToPosition = useCallback(
    (time: number) => {
      const wasPlaying = Tone.getTransport().state === "started";
      if (wasPlaying) {
        pausePlayback();
      }

      clearScheduledEvents();
      Tone.getTransport().seconds = time;
    },
    [pausePlayback, clearScheduledEvents],
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (schedulerCleanupRef.current) {
        schedulerCleanupRef.current();
      }
      stopPlayback();
    };
  }, [stopPlayback]);

  return {
    startPlayback,
    stopPlayback,
    pausePlayback,
    switchPlaybackMode,
    seekToPosition,
    isTransitioning: modeTransitionPending.current,
  };
};
