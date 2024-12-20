// src/features/clips/services/ClipEngine.ts
import * as Tone from "tone";
import {
  ClipEngine,
  ClipContent,
  ArrangementClip,
  ClipState,
  MidiClipContent,
  ClipLoop,
} from "../types";
import { EngineState, useEngineStore } from "@/core/stores/useEngineStore";
import { Time, Decibels } from "tone/build/esm/core/type/Units";
import { v4 as uuidv4 } from "uuid";
import {
  isValidClipContent,
  validateAudioBuffer,
  validateFadeTimes,
  validateMidiContent,
} from "../utils/validation";
import {
  createMidiContent,
  createMidiExport,
  prepareMidiTracks,
  startMidiClip,
} from "../utils/midiUtils";
import {
  startAudioClip,
  updatePlayerFades,
  updatePlayerVolume,
} from "../utils/audioUtils";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;

  private calculateTotalDuration(state: EngineState): Time {
    let maxEndTime = 0;

    // Calculate max end time from all active clips
    Object.values(state.clips.activeClips).forEach(({ clip }) => {
      const clipEnd =
        Tone.Time(clip.startTime).toSeconds() +
        Tone.Time(clip.duration).toSeconds();
      maxEndTime = Math.max(maxEndTime, clipEnd);
    });

    return maxEndTime;
  }

  parseMidiFile(midiData: ArrayBuffer): string {
    const midiContent = createMidiContent(midiData);
    return this.createMidiClip(midiContent);
  }

  exportMidiFile(contentId: string): Uint8Array {
    const content = this.getClipContent(contentId);
    if (!content?.midiData) {
      throw new Error("Not a MIDI clip");
    }
    return createMidiExport(content.midiData);
  }

  createMidiClip(midiData: MidiClipContent): string {
    validateMidiContent(midiData);

    const id = crypto.randomUUID();
    const content: ClipContent = {
      id,
      type: "midi",
      name: midiData.name || `MIDI Clip ${id.slice(0, 4)}`,
      midiData,
    };

    try {
      useEngineStore.setState((state) => ({
        clips: {
          ...state.clips,
          contents: {
            ...state.clips.contents,
            [id]: content,
          },
        },
      }));

      return id;
    } catch (error) {
      console.error("Failed to create MIDI clip:", error);
      throw error;
    }
  }

  createAudioClip(buffer: Tone.ToneAudioBuffer): string {
    // Validate buffer before any state changes
    if (!buffer?.loaded) {
      throw new Error("Invalid or unloaded audio buffer");
    }

    // Generate ID and prepare content outside setState
    const id = uuidv4();

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
      // Atomic state update
      useEngineStore.setState((state) => {
        if (state.clips.contents[id]) {
          throw new Error("Duplicate clip ID generated");
        }

        return {
          clips: {
            ...state.clips,
            contents: {
              ...state.clips.contents,
              [id]: content,
            },
          },
        };
      });

      return id;
    } catch (error) {
      // Log error and rethrow with context
      console.error("Failed to create audio clip:", error);
      throw error;
    }
  }

  getClipContent(contentId: string): ClipContent {
    return useEngineStore.getState().clips.contents[contentId];
  }

  scheduleClip(clip: ArrangementClip): void {
    // Get current state outside setState
    const state = useEngineStore.getState();
    const content = state.clips.contents[clip.contentId];

    if (!content) return;

    try {
      if (content.type === "midi" && content.midiData) {
        const preparedTracks = prepareMidiTracks(content, clip);
        const newState = {
          ...state,
          clips: {
            ...state.clips,
            activeClips: {
              ...state.clips.activeClips,
              ...preparedTracks.activeClips,
            },
          },
        };

        const newDuration = this.calculateTotalDuration(newState);

        // Update state atomically
        useEngineStore.setState((state) => ({
          ...newState,
          transport: {
            ...state.transport,
            duration: newDuration,
          },
        }));

        // Start all parts after state update
        preparedTracks.parts.forEach((part) => part.start(clip.startTime));
      } else if (content.type === "audio" && content.buffer) {
        const preparedPlayer = this.prepareAudioPlayer(content, clip);

        // Update state atomically
        useEngineStore.setState((state) => ({
          clips: {
            ...state.clips,
            activeClips: {
              ...state.clips.activeClips,
              [clip.id]: { part: preparedPlayer, clip },
            },
          },
        }));

        // Start playback after state update
        preparedPlayer.start(clip.startTime);
      }
    } catch (error) {
      console.error("Failed to schedule clip:", error);
      this.cleanupFailedScheduling(clip.id);
      throw error;
    }
  }

  private prepareAudioPlayer(
    content: ClipContent,
    clip: ArrangementClip,
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

  private cleanupFailedScheduling(clipId: string): void {
    try {
      // Clean up any partially created resources
      const state = useEngineStore.getState();
      const activeClip = state.clips.activeClips[clipId];

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

  unscheduleClip(clipId: string): void {
    // Get current state and clip data outside setState
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    if (!activeClip) return;

    try {
      // Cleanup audio nodes outside setState
      this.disposeClipResources(activeClip);

      // Then update state atomically
      useEngineStore.setState((state) => {
        // Create new activeClips object without the specified clipId
        const { [clipId]: removed, ...remainingClips } =
          state.clips.activeClips;

        const newState = {
          ...state,
          clips: {
            ...state.clips,
            activeClips: remainingClips,
          },
        };

        const newDuration = this.calculateTotalDuration(newState);

        return {
          ...newState,
          transport: {
            ...state.transport,
            duration: newDuration,
          },
        };
      });
    } catch (error) {
      console.error(`Failed to unschedule clip ${clipId}:`, error);
      // Even if cleanup fails, we should still remove from state
      // to prevent memory leaks and state inconsistencies
      useEngineStore.setState((state) => {
        const { [clipId]: removed, ...remainingClips } =
          state.clips.activeClips;
        return {
          clips: {
            ...state.clips,
            activeClips: remainingClips,
          },
        };
      });

      // Rethrow the error after state cleanup
      throw error;
    }
  }

  private disposeClipResources(activeClip: {
    part: Tone.Part | Tone.Player | null;
    clip: ArrangementClip;
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

  addClip(contentId: string, startTime: Time): string {
    // Validate inputs and prepare clip data before any state changes
    const currentState = useEngineStore.getState();
    const content = currentState.clips.contents[contentId];

    if (!content) {
      throw new Error("Clip content not found");
    }

    // Validate content structure
    if (!isValidClipContent(content)) {
      throw new Error(`Invalid clip content for ${content.type} clip`);
    }

    const id = uuidv4();

    // Prepare clip data
    const clip: ArrangementClip = {
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
      useEngineStore.setState((state) => ({
        clips: {
          ...state.clips,
          activeClips: {
            ...state.clips.activeClips,
            [id]: {
              part: null, // Will be set by scheduleClip
              clip,
            },
          },
        },
      }));

      // Then schedule the clip
      try {
        this.scheduleClip(clip);
      } catch (schedulingError) {
        // If scheduling fails, clean up the state
        this.removeClipFromState(id);
        throw schedulingError;
      }

      return id;
    } catch (error) {
      console.error("Failed to add clip:", error);
      // Clean up any partial state changes
      this.removeClipFromState(id);
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

  private removeClipFromState(clipId: string): void {
    try {
      useEngineStore.setState((state) => {
        const { [clipId]: removed, ...remainingClips } =
          state.clips.activeClips;
        return {
          clips: {
            ...state.clips,
            activeClips: remainingClips,
          },
        };
      });
    } catch (error) {
      console.error("Failed to clean up clip state:", error);
      // Don't throw here as this is already error handling
    }
  }

  removeClip(clipId: string): void {
    useEngineStore.setState((state) => {
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
      const { [clipId]: removed, ...remainingClips } = state.clips.activeClips;

      return {
        clips: {
          ...state.clips,
          activeClips: remainingClips,
        },
      };
    });
  }

  moveClip(clipId: string, newTime: Time): void {
    // Get current state outside setState
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    // Early returns if invalid state
    if (!activeClip) return;
    if (
      !(
        activeClip.part instanceof Tone.Part ||
        activeClip.part instanceof Tone.Player
      )
    ) {
      return;
    }

    try {
      // Reschedule the audio/MIDI part outside setState
      this.rescheduleClipTiming(activeClip.part, newTime, activeClip.clip);

      // Then update state atomically
      useEngineStore.setState((state) => {
        const newState = {
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
        };

        const newDuration = this.calculateTotalDuration(newState);

        return {
          ...newState,
          transport: {
            ...state.transport,
            duration: newDuration,
          },
        };
      });
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
    newTime: Time,
    clip: ArrangementClip,
  ): void {
    try {
      if (part instanceof Tone.Part) {
        // Handle MIDI part rescheduling
        part.stop();
        part.start(newTime);

        // Update loop points if needed
        if (clip.loop?.enabled) {
          const newLoopEnd =
            Tone.Time(clip.loop.start).toSeconds() +
            Tone.Time(clip.loop.duration).toSeconds();
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
          part.loopEnd =
            Tone.Time(clip.loop.start).toSeconds() +
            Tone.Time(clip.loop.duration).toSeconds();
        }
      }
    } catch (error) {
      console.warn("Error rescheduling clip:", error);
      throw error;
    }
  }

  setClipLoop(
    clipId: string,
    enabled: boolean,
    settings?: { start: Time; duration: Time },
  ): void {
    useEngineStore.setState((state) => {
      const activeClip = state.clips.activeClips[clipId];
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
          const loopEnd =
            Tone.Time(settings.start).toSeconds() +
            Tone.Time(settings.duration).toSeconds();

          part.loopStart = settings.start;
          part.loopEnd = loopEnd;
        }

        return {
          clips: {
            ...state.clips,
            activeClips: {
              ...state.clips.activeClips,
              [clipId]: {
                ...activeClip,
                clip: {
                  ...activeClip.clip,
                  loop,
                },
              },
            },
          },
        };
      }

      return state; // No change if part is neither Part nor Player
    });
  }

  setClipGain(clipId: string, gain: Decibels): void {
    // Get current state outside setState
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    // Early return if no clip found
    if (!activeClip) return;

    // Early return if not an audio clip
    if (!(activeClip.part instanceof Tone.Player)) return;

    try {
      // Update audio node gain outside setState
      updatePlayerVolume(activeClip.part, gain);

      // Then update state atomically
      useEngineStore.setState((state) => ({
        clips: {
          ...state.clips,
          activeClips: {
            ...state.clips.activeClips,
            [clipId]: {
              ...activeClip,
              clip: {
                ...activeClip.clip,
                gain,
              },
            },
          },
        },
      }));
    } catch (error) {
      console.error(`Failed to set clip gain for ${clipId}:`, error);

      // Attempt to restore original gain
      try {
        updatePlayerVolume(activeClip.part, activeClip.clip.gain);
      } catch (restoreError) {
        console.error("Failed to restore clip gain:", restoreError);
      }

      throw error;
    }
  }

  setClipFades(clipId: string, fadeIn: Time, fadeOut: Time): void {
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    if (!activeClip || !(activeClip.part instanceof Tone.Player)) {
      return;
    }

    try {
      validateFadeTimes(fadeIn, fadeOut, activeClip.clip.duration);
      updatePlayerFades(activeClip.part, fadeIn, fadeOut);

      useEngineStore.setState((state) => ({
        clips: {
          ...state.clips,
          activeClips: {
            ...state.clips.activeClips,
            [clipId]: {
              ...activeClip,
              clip: {
                ...activeClip.clip,
                fadeIn,
                fadeOut,
              },
            },
          },
        },
      }));
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
        console.error("Failed to restore original fades:", restoreError);
      }

      throw error;
    }
  }

  playClip(clipId: string, startTime?: Time): void {
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

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

  stopClip(clipId: string): void {
    // Get clip data outside setState
    const activeClip = useEngineStore.getState().clips.activeClips[clipId];
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
        part.stop();
      } else if (part instanceof Tone.Part) {
        part.stop();
      }
    } catch (error) {
      console.warn("Error stopping clip playback:", error);
      throw error;
    }
  }

  isClipPlaying(clipId: string): boolean {
    const state = useEngineStore.getState().clips;
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

  getPlaybackPosition(clipId: string): Time {
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Player) {
        return activeClip.part.toSeconds();
      } else if (activeClip.part instanceof Tone.Part) {
        // For MIDI parts, calculate position relative to clip start
        const transportTime = Tone.getTransport().seconds;
        const clipStartSeconds = Tone.Time(
          activeClip.clip.startTime,
        ).toSeconds();
        return Math.max(0, transportTime - clipStartSeconds);
      }
    }
    return 0;
  }

  getState(): ClipState {
    return useEngineStore.getState().clips;
  }

  dispose(): void {
    if (this.disposed) return;

    // Clean up all active clips
    const state = useEngineStore.getState();
    Object.keys(state.clips.activeClips).forEach((clipId) => {
      this.unscheduleClip(clipId);
    });

    this.disposed = true;
  }
}
