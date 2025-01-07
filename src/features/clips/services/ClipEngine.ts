// src/features/clips/services/ClipEngine.ts
import * as Tone from "tone";
import {
  ClipEngine,
  ClipContent,
  CompositionClip,
  ClipState,
  MidiClipContent,
  ClipLoop,
} from "../types";
import { EngineState } from "@/core/stores/useEngineStore";
import {
  isValidClipContent,
  validateAudioBuffer,
  validateFadeTimes,
  validateMidiContent,
} from "../utils/validation";
import { prepareMidiTracks, startMidiClip } from "../utils/midiUtils";
import {
  startAudioClip,
  updatePlayerFades,
  updatePlayerVolume,
  stopAudioClip,
} from "../utils/audioUtils";
import {
  updateClipAndTransportState,
  updateClipState,
} from "../utils/stateUtils";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;

  private calculateTotalDuration(state: EngineState): number {
    let maxEndTime = 0;

    // Calculate max end time from all active clips
    Object.values(state.clips.activeClips).forEach(({ clip }) => {
      const clipEnd = clip.startTime + clip.duration;
      maxEndTime = Math.max(maxEndTime, clipEnd);
    });

    return maxEndTime;
  }

  createMidiClip(state: ClipState, midiData: MidiClipContent): ClipState {
    validateMidiContent(midiData);

    const id = crypto.randomUUID();
    const content: ClipContent = {
      id,
      type: "midi",
      name: midiData.name || `MIDI Clip ${id.slice(0, 4)}`,
      midiData,
    };

    try {
      return updateClipState(state, {
        contents: {
          ...state.contents,
          [id]: content,
        },
      });
    } catch (error) {
      console.error("Failed to create MIDI clip");
      throw error;
    }
  }

  createAudioClip(state: ClipState, buffer: Tone.ToneAudioBuffer): ClipState {
    // Validate buffer before any state changes
    if (!buffer?.loaded) {
      throw new Error("Invalid or unloaded audio buffer");
    }

    // Generate ID and prepare content outside setState
    const id = crypto.randomUUID();

    // Validate buffer properties
    const validationResult = validateAudioBuffer(buffer);
    if (!validationResult.isValid) {
      throw new Error(`Invalid audio buffer: ${validationResult.error}`);
    }

    const content: ClipContent = {
      id,
      type: "audio",
      name: `Audio Clip ${id.slice(0, 4)}`,
      buffer,
    };

    try {
      return updateClipState(state, {
        contents: {
          ...state.contents,
          [id]: content,
        },
      });
    } catch (error) {
      // Log error and rethrow with context
      console.error("Failed to create audio clip:", error);
      throw error;
    }
  }

  getClipContent(state: ClipState, contentId: string): ClipContent {
    return state.contents[contentId];
  }

  private scheduleClip(state: EngineState, clip: CompositionClip): EngineState {
    const content = state.clips.contents[clip.contentId];

    if (!content) return state;

    try {
      if (content.type === "midi" && content.midiData) {
        const preparedTracks = prepareMidiTracks(content, clip);
        const newState = updateClipAndTransportState(
          state,
          {
            activeClips: {
              ...state.clips.activeClips,
              ...preparedTracks.activeClips,
            },
          },
          {
            duration: this.calculateTotalDuration({
              ...state,
              clips: {
                ...state.clips,
                activeClips: {
                  ...state.clips.activeClips,
                  ...preparedTracks.activeClips,
                },
              },
            }),
          },
        );

        // Start all parts after state update
        preparedTracks.parts.forEach((part) => part.start(clip.startTime));
        return newState;
      } else if (content.type === "audio" && content.buffer) {
        const preparedPlayer = this.prepareAudioPlayer(content, clip);

        const newState = updateClipAndTransportState(state, {
          activeClips: {
            ...state.clips.activeClips,
            [clip.id]: { part: preparedPlayer, clip },
          },
        });

        // Start playback after state update
        preparedPlayer.start(clip.startTime);
        return newState;
      }
      return state;
    } catch (error) {
      console.error("Failed to schedule clip:", error);
      this.cleanupFailedScheduling(state.clips, clip.id);
      throw error;
    }
  }

  private prepareAudioPlayer(
    content: ClipContent,
    clip: CompositionClip,
  ): Tone.Player {
    return new Tone.Player({
      url: content.buffer,
      loop: clip.loop?.enabled ?? false,
      loopStart: clip.loop?.start ?? 0,
      loopEnd:
        (Tone.Time(clip.loop?.start).toSeconds() ?? 0) +
        (Tone.Time(clip.loop?.duration).toSeconds() ?? 0),
    }).toDestination();
  }

  private cleanupFailedScheduling(state: ClipState, clipId: string): void {
    try {
      // Clean up any partially created resources
      const activeClip = state.activeClips[clipId];

      if (activeClip?.part) {
        if (activeClip.part instanceof Tone.Part) {
          activeClip.part.dispose();
        } else if (activeClip.part instanceof Tone.Player) {
          activeClip.part.dispose();
        }
      }
    } catch (error) {
      console.warn("Cleanup after failed scheduling failed:", error);
    }
  }

  private unscheduleClip(state: EngineState, clipId: string): EngineState {
    const activeClip = state.clips.activeClips[clipId];

    if (!activeClip) return state;

    try {
      // Cleanup audio nodes outside setState
      this.disposeClipResources(activeClip);

      // Then update state atomically
      const { [clipId]: removed, ...remainingClips } = state.clips.activeClips;

      const newState = updateClipAndTransportState(
        state,
        {
          activeClips: remainingClips,
        },
        {
          duration: this.calculateTotalDuration({
            ...state,
            clips: {
              ...state.clips,
              activeClips: remainingClips,
            },
          }),
        },
      );
      return newState;
    } catch (error) {
      console.error(`Failed to unschedule clip ${clipId}:`, error);
      // Even if cleanup fails, we should still remove from state
      // to prevent memory leaks and state inconsistencies
      const { [clipId]: removed, ...remainingClips } = state.clips.activeClips;
      return updateClipAndTransportState(state, {
        activeClips: remainingClips,
      });

      // Rethrow the error after state cleanup
      throw error;
    }
  }

  private disposeClipResources(activeClip: {
    part: Tone.Part | Tone.Player | null;
    clip: CompositionClip;
  }): void {
    if (!activeClip.part) return;

    try {
      if (activeClip.part instanceof Tone.Part) {
        // Stop and cleanup MIDI part
        activeClip.part.stop();
        activeClip.part.dispose();
      } else if (activeClip.part instanceof Tone.Player) {
        // Stop and cleanup audio player
        activeClip.part.stop();
        activeClip.part.dispose();
      }
    } catch (error) {
      console.warn("Error disposing clip resources:", error);
      throw error; // Rethrow to handle in the main function
    }
  }

  addClip(
    state: EngineState,
    contentId: string,
    startTime: number,
  ): EngineState {
    // Validate inputs and prepare clip data before any state changes
    const content = state.clips.contents[contentId];

    if (!content) {
      throw new Error("Clip content not found");
    }

    // Validate content structure
    if (!isValidClipContent(content)) {
      throw new Error(`Invalid clip content for ${content.type} clip`);
    }

    const id = crypto.randomUUID();

    // Prepare clip data
    const clip: CompositionClip = {
      id,
      contentId,
      startTime,
      duration: this.calculateClipDuration(content),
      gain: 0,
      fadeIn: 0,
      fadeOut: 0,
    };

    try {
      // First, update state atomically
      const newState = updateClipAndTransportState(state, {
        activeClips: {
          ...state.clips.activeClips,
          [id]: {
            part: null, // Will be set by scheduleClip
            clip,
          },
        },
      });

      // Then schedule the clip
      try {
        return this.scheduleClip(newState, clip);
      } catch (schedulingError) {
        // If scheduling fails, clean up the state
        this.removeClipFromState(newState, id);
        throw schedulingError;
      }
    } catch (error) {
      console.error("Failed to add clip:", error);
      // Clean up any partial state changes
      this.removeClipFromState(state, id);
      throw error;
    }
  }

  private calculateClipDuration(content: ClipContent): number {
    if (content.type === "midi") {
      return content.midiData?.duration ?? 0;
    } else if (content.type === "audio") {
      return content.buffer?.duration ?? 0;
    }
    return 0;
  }

  private removeClipFromState(state: EngineState, clipId: string): void {
    try {
      updateClipAndTransportState(state, {
        activeClips: (({ [clipId]: removed, ...remainingClips }) =>
          remainingClips)(state.clips.activeClips),
      });
    } catch (error) {
      console.error("Failed to clean up clip state:", error);
      // Don't throw here as this is already error handling
    }
  }

  removeClip(state: EngineState, clipId: string): EngineState {
    // First unschedule the clip to clean up audio resources
    const activeClip = state.clips.activeClips[clipId];
    if (activeClip?.part) {
      if (activeClip.part instanceof Tone.Part) {
        activeClip.part.dispose();
      } else if (activeClip.part instanceof Tone.Player) {
        activeClip.part.stop().dispose();
      }
    }

    // Remove from active clips using object destructuring
    return updateClipAndTransportState(state, {
      activeClips: (({ [clipId]: removed, ...remainingClips }) =>
        remainingClips)(state.clips.activeClips),
    });
  }

  moveClip(state: EngineState, clipId: string, newTime: number): EngineState {
    // Get current state outside setState
    const activeClip = state.clips.activeClips[clipId];

    // Early returns if invalid state
    if (!activeClip) return state;
    if (
      !(
        activeClip.part instanceof Tone.Part ||
        activeClip.part instanceof Tone.Player
      )
    ) {
      return state;
    }

    try {
      // Reschedule the audio/MIDI part outside setState
      this.rescheduleClipTiming(activeClip.part, newTime, activeClip.clip);

      // Then update state atomically
      return updateClipAndTransportState(
        state,
        {
          activeClips: {
            ...state.clips.activeClips,
            [clipId]: {
              ...activeClip,
              clip: {
                ...activeClip.clip,
                startTime: newTime,
              },
            },
          },
        },
        {
          duration: this.calculateTotalDuration({
            ...state,
            clips: {
              ...state.clips,
              activeClips: {
                ...state.clips.activeClips,
                [clipId]: {
                  ...activeClip,
                  clip: {
                    ...activeClip.clip,
                    startTime: newTime,
                  },
                },
              },
            },
          }),
        },
      );
    } catch (error) {
      console.error(`Failed to move clip ${clipId}:`, error);
      // Attempt to restore original timing
      try {
        this.rescheduleClipTiming(
          activeClip.part,
          activeClip.clip.startTime,
          activeClip.clip,
        );
      } catch (restoreError) {
        console.error("Failed to restore clip timing:", restoreError);
      }
      throw error;
    }
  }

  private rescheduleClipTiming(
    part: Tone.Part | Tone.Player,
    newTime: number,
    clip: CompositionClip,
  ): void {
    try {
      if (part instanceof Tone.Part) {
        // Handle MIDI part rescheduling
        part.stop();
        part.start(newTime);

        // Update loop points if needed
        if (clip.loop?.enabled) {
          const newLoopEnd = clip.loop.start + clip.loop.duration;
          part.loopStart = clip.loop.start;
          part.loopEnd = newLoopEnd;
        }
      } else if (part instanceof Tone.Player) {
        // Handle audio player rescheduling
        const wasPlaying = part.state === "started";
        part.stop();

        if (wasPlaying) {
          part.start(newTime);
        }

        // Update loop points if needed
        if (clip.loop?.enabled) {
          part.loopStart = clip.loop.start;
          part.loopEnd = clip.loop.start + clip.loop.duration;
        }
      }
    } catch (error) {
      console.warn("Error rescheduling clip:", error);
      throw error;
    }
  }

  setClipLoop(
    state: ClipState,
    clipId: string,
    enabled: boolean,
    settings?: { start: number; duration: number },
  ): ClipState {
    const activeClip = state.activeClips[clipId];
    if (!activeClip) return state; // No change if clip not found

    const { part } = activeClip;
    if (!part) return state; // No change if no part

    if (part instanceof Tone.Part || part instanceof Tone.Player) {
      part.loop = enabled;

      // Create the loop object with required properties
      const loop: ClipLoop = {
        enabled,
        start: settings?.start ?? 0,
        duration: settings?.duration ?? 0,
      };

      if (settings) {
        const loopEnd = settings.start + settings.duration;

        part.loopStart = settings.start;
        part.loopEnd = loopEnd;
      }

      return updateClipState(state, {
        activeClips: {
          ...state.activeClips,
          [clipId]: {
            ...activeClip,
            clip: {
              ...activeClip.clip,
              loop,
            },
          },
        },
      });
    }

    return state; // No change if part is neither Part nor Player
  }

  setClipGain(state: ClipState, clipId: string, gain: number): ClipState {
    // Get current state outside setState
    const activeClip = state.activeClips[clipId];

    // Early return if no clip found
    if (!activeClip) return state;

    // Early return if not an audio clip
    if (!(activeClip.part instanceof Tone.Player)) return state;

    try {
      // Update audio node gain outside setState
      updatePlayerVolume(activeClip.part, gain);

      // Then update state atomically
      return updateClipState(state, {
        activeClips: {
          ...state.activeClips,
          [clipId]: {
            ...activeClip,
            clip: {
              ...activeClip.clip,
              gain,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Failed to set clip gain for ${clipId}:`);

      // Attempt to restore original gain
      try {
        updatePlayerVolume(activeClip.part, activeClip.clip.gain);
      } catch (restoreError) {
        console.error("Failed to restore clip gain");
        throw restoreError;
      }

      throw error;
    }
  }

  setClipFades(
    state: ClipState,
    clipId: string,
    fadeIn: number,
    fadeOut: number,
  ): ClipState {
    const activeClip = state.activeClips[clipId];

    if (!activeClip || !(activeClip.part instanceof Tone.Player)) {
      return state;
    }

    try {
      validateFadeTimes(fadeIn, fadeOut, activeClip.clip.duration);
      updatePlayerFades(activeClip.part, fadeIn, fadeOut);

      return updateClipState(state, {
        activeClips: {
          ...state.activeClips,
          [clipId]: {
            ...activeClip,
            clip: {
              ...activeClip.clip,
              fadeIn,
              fadeOut,
            },
          },
        },
      });
    } catch (error) {
      console.error(`Failed to set clip fades for ${clipId}:`, error);

      // Attempt to restore original fades
      try {
        updatePlayerFades(
          activeClip.part,
          activeClip.clip.fadeIn,
          activeClip.clip.fadeOut,
        );
      } catch (restoreError) {
        console.error("Failed to restore original fades");
        throw restoreError;
      }
      throw error;
    }
  }

  playClip(state: ClipState, clipId: string, startTime?: number): void {
    const activeClip = state.activeClips[clipId];

    if (!activeClip) return;

    try {
      if (activeClip.part instanceof Tone.Player) {
        startAudioClip(activeClip.part, startTime);
      } else if (activeClip.part instanceof Tone.Part) {
        startMidiClip(activeClip.part, startTime);
      }
    } catch (error) {
      console.error(`Failed to play clip ${clipId}:`, error);
      throw error;
    }
  }

  stopClip(state: ClipState, clipId: string): void {
    const activeClip = state.activeClips[clipId];
    if (!activeClip) return;

    try {
      this.stopClipPlayback(activeClip.part);
    } catch (error) {
      console.error(`Failed to stop clip ${clipId}:`, error);
      throw error;
    }
  }

  private stopClipPlayback(part: Tone.Part | Tone.Player | null): void {
    if (!part) return;

    try {
      if (part instanceof Tone.Player) {
        stopAudioClip(part);
      } else if (part instanceof Tone.Part) {
        part.stop();
      }
    } catch (error) {
      console.warn("Error stopping clip playback:", error);
      throw error;
    }
  }

  isClipPlaying(state: ClipState, clipId: string): boolean {
    const activeClip = state.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Player) {
        return activeClip.part.state === "started";
      } else if (activeClip.part instanceof Tone.Part) {
        return activeClip.part.state === "started";
      }
    }
    return false;
  }

  getPlaybackPosition(state: ClipState, clipId: string): number {
    const activeClip = state.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Player) {
        return activeClip.part.toSeconds();
      } else if (activeClip.part instanceof Tone.Part) {
        // For MIDI parts, calculate position relative to clip start
        const transportTime = Tone.getTransport().seconds;
        const clipStartSeconds = activeClip.clip.startTime;
        return Math.max(0, transportTime - clipStartSeconds);
      }
    }
    return 0;
  }

  dispose(state: EngineState): void {
    if (this.disposed) return;

    // Clean up all active clips
    Object.keys(state.clips.activeClips).forEach((clipId) => {
      this.unscheduleClip(state, clipId);
    });

    this.disposed = true;
  }
}
