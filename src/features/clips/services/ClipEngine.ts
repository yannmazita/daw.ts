// src/features/clips/services/ClipEngine.ts
import * as Tone from "tone";
import { Midi } from "@tonejs/midi";
import {
  ClipEngine,
  ClipContent,
  ArrangementClip,
  ClipState,
  MidiNote,
  MidiClipContent,
  ClipLoop,
  MidiTrackData,
} from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Time, Decibels } from "tone/build/esm/core/type/Units";
import { v4 as uuidv4 } from "uuid";
import {
  isValidClipContent,
  validateAudioBuffer,
  validateMidiContent,
} from "../utils/validation";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;

  parseMidiFile(midiData: ArrayBuffer): string {
    const midi = new Midi(midiData);

    const midiContent: MidiClipContent = {
      name: midi.name || "Imported MIDI",
      duration: midi.duration,
      tracks: midi.tracks.map((track) => ({
        name: track.name,
        notes: track.notes.map((note) => ({
          midi: note.midi,
          name: note.name,
          pitch: note.pitch,
          octave: note.octave,
          velocity: note.velocity,
          duration: note.duration,
          time: note.time,
          ticks: note.ticks,
        })),
        controlChanges: Object.fromEntries(
          Object.entries(track.controlChanges).map(([ccNum, changes]) => [
            ccNum,
            changes.map((cc) => ({
              number: cc.number,
              value: cc.value,
              time: cc.time ?? 0, // Default to 0 if undefined
              ticks: cc.ticks,
            })),
          ]),
        ),
        instrument: {
          number: track.instrument.number,
          family: track.instrument.family,
          name: track.instrument.name,
          percussion: track.instrument.percussion,
        },
        channel: track.channel,
      })),
      tempos: midi.header.tempos.map((tempo) => ({
        bpm: tempo.bpm,
        time: tempo.time ?? 0, // Default to 0 if undefined
      })),
      timeSignatures: midi.header.timeSignatures.map((ts) => ({
        timeSignature: [ts.timeSignature[0], ts.timeSignature[1]],
        time: Tone.Time(ts.ticks).toSeconds() ?? 0, // Default to 0 if undefined
      })),
    };

    return this.createMidiClip(midiContent);
  }

  exportMidiFile(contentId: string): Uint8Array {
    const content = this.getClipContent(contentId);
    if (!content?.midiData) {
      throw new Error("Not a MIDI clip");
    }

    const midi = new Midi();
    midi.name = content.midiData.name;

    content.midiData.tracks.forEach((trackData) => {
      const track = midi.addTrack();
      track.name = trackData.name ?? "";
      track.channel = trackData.channel;

      // Add notes
      trackData.notes.forEach((note) => {
        track.addNote({
          midi: note.midi,
          time: note.time,
          duration: note.duration,
          velocity: note.velocity,
        });
      });

      // Add control changes
      Object.entries(trackData.controlChanges).forEach(([ccNum, changes]) => {
        changes.forEach((cc) => {
          track.addCC({
            number: cc.number,
            value: cc.value,
            time: cc.time,
          });
        });
      });

      // Set instrument
      track.instrument.number = trackData.instrument.number;
    });

    return midi.toArray();
  }

  createMidiClip(midiData: MidiClipContent): string {
    // Validate MIDI data before creating clip
    validateMidiContent(midiData);

    const id = crypto.randomUUID();
    const content: ClipContent = {
      id,
      type: "midi",
      name: midiData.name || `MIDI Clip ${id.slice(0, 4)}`, // Ensure name exists
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
        const preparedTracks = this.prepareMidiTracks(content, clip);

        // Update state atomically with prepared tracks
        useEngineStore.setState((state) => ({
          clips: {
            ...state.clips,
            activeClips: {
              ...state.clips.activeClips,
              ...preparedTracks.activeClips,
            },
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

  private prepareMidiTracks(content: ClipContent, clip: ArrangementClip) {
    const preparedParts: Tone.Part[] = [];
    const activeClips: Record<
      string,
      { part: Tone.Part; clip: ArrangementClip }
    > = {};

    content.midiData.tracks.forEach((track, trackIndex) => {
      try {
        const synth = new Tone.PolySynth().toDestination();
        // Set the instrument based on track.instrument

        const part = new Tone.Part((time, note: MidiNote) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            time,
            note.velocity,
          );
        }, track.notes);

        // Configure loop settings
        if (clip.loop?.enabled) {
          part.loop = true;
          part.loopStart = clip.loop.start;
          part.loopEnd =
            Tone.Time(clip.loop.start).toSeconds() +
            Tone.Time(clip.loop.duration).toSeconds();
        }

        // Handle control changes
        this.setupControlChanges(track, clip.startTime);

        // Store prepared part
        preparedParts.push(part);

        // Create clip instance ID
        const clipInstanceId =
          content.midiData.tracks.length > 1
            ? `${clip.id}_${trackIndex}`
            : clip.id;

        activeClips[clipInstanceId] = { part, clip };
      } catch (error) {
        // Cleanup any successfully created parts before throwing
        preparedParts.forEach((p) => p.dispose());
        throw error;
      }
    });

    return { parts: preparedParts, activeClips };
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

  private setupControlChanges(track: MidiTrackData, startTime: Time): void {
    Object.values(track.controlChanges).forEach((changes) => {
      changes.forEach((cc) => {
        Tone.getTransport().schedule(
          (time) => {
            // todo: handle control changes based on cc.number
            // example: handle modulation, expression, etc.
          },
          cc.time + Tone.Time(startTime).toSeconds(),
        );
      });
    });
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

        return {
          clips: {
            ...state.clips,
            activeClips: remainingClips,
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
      useEngineStore.setState((state) => ({
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
      }));
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
      this.updateClipVolume(activeClip.part, gain);

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
        this.updateClipVolume(activeClip.part, activeClip.clip.gain);
      } catch (restoreError) {
        console.error("Failed to restore clip gain:", restoreError);
      }

      throw error;
    }
  }

  private updateClipVolume(player: Tone.Player, gain: Decibels): void {
    try {
      // Validate gain value
      if (!Number.isFinite(gain)) {
        throw new Error("Invalid gain value");
      }

      const now = Tone.now();
      player.volume.cancelScheduledValues(now);
      player.volume.rampTo(gain, 0.05); // 50ms fade to prevent clicks
    } catch (error) {
      console.warn("Error updating clip volume:", error);
      throw error;
    }
  }

  setClipFades(clipId: string, fadeIn: Time, fadeOut: Time): void {
    // Get current state outside setState
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    // Early return if no valid clip
    if (!activeClip || !(activeClip.part instanceof Tone.Player)) {
      return;
    }

    try {
      // Validate fade times
      this.validateFadeTimes(fadeIn, fadeOut, activeClip.clip.duration);

      // Update Tone.js Player outside setState
      this.updatePlayerFades(activeClip.part, fadeIn, fadeOut);

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
        this.updatePlayerFades(
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

  private validateFadeTimes(
    fadeIn: Time,
    fadeOut: Time,
    clipDuration: Time,
  ): void {
    const fadeInSeconds = Tone.Time(fadeIn).toSeconds();
    const fadeOutSeconds = Tone.Time(fadeOut).toSeconds();
    const durationSeconds = Tone.Time(clipDuration).toSeconds();

    if (fadeInSeconds < 0) {
      throw new Error("Fade in time cannot be negative");
    }

    if (fadeOutSeconds < 0) {
      throw new Error("Fade out time cannot be negative");
    }

    if (fadeInSeconds + fadeOutSeconds > durationSeconds) {
      throw new Error("Combined fade times cannot exceed clip duration");
    }
  }

  private updatePlayerFades(
    player: Tone.Player,
    fadeIn: Time,
    fadeOut: Time,
  ): void {
    try {
      const fadeInSeconds = Tone.Time(fadeIn).toSeconds();
      const fadeOutSeconds = Tone.Time(fadeOut).toSeconds();

      // Store current playback state
      const wasPlaying = player.state === "started";
      const currentTime = Tone.getTransport().seconds;

      // Apply new fade settings
      player.fadeIn = fadeInSeconds;
      player.fadeOut = fadeOutSeconds;

      // Restore playback state if needed
      if (wasPlaying) {
        player.stop();
        player.start(currentTime); // Resume from transport time
      }
    } catch (error) {
      console.warn("Error updating player fades:", error);
      throw error;
    }
  }

  playClip(clipId: string, startTime?: Time): void {
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    if (!activeClip) return;

    try {
      // Start playback outside setState
      if (activeClip.part instanceof Tone.Player) {
        // For audio clips
        this.startAudioClip(activeClip.part, startTime);
      } else if (activeClip.part instanceof Tone.Part) {
        // For MIDI clips
        this.startMidiClip(activeClip.part, startTime);
      }
    } catch (error) {
      console.error(`Failed to play clip ${clipId}:`, error);
      throw error;
    }
  }

  private startAudioClip(player: Tone.Player, startTime?: Time): void {
    try {
      // Ensure audio context is running
      if (Tone.getContext().state !== "running") {
        throw new Error("Audio context is not running");
      }

      // Handle different start time scenarios
      if (startTime !== undefined) {
        player.start(startTime);
      } else {
        player.start();
      }
    } catch (error) {
      console.warn("Error starting audio clip:", error);
      throw error;
    }
  }

  private startMidiClip(part: Tone.Part, startTime?: Time): void {
    try {
      // Ensure transport is ready
      if (!Tone.getTransport().state) {
        throw new Error("Transport is not initialized");
      }

      // Handle different start time scenarios
      if (startTime !== undefined) {
        part.start(startTime);
      } else {
        part.start();
      }
    } catch (error) {
      console.warn("Error starting MIDI clip:", error);
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
