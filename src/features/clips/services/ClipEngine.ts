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
} from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Time, Decibels } from "tone/build/esm/core/type/Units";
import { v4 as uuidv4 } from "uuid";

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
    const state = useEngineStore.getState().clips;
    const id = crypto.randomUUID();
    const content: ClipContent = {
      id,
      type: "midi",
      name: midiData.name,
      midiData,
    };

    useEngineStore.getState().updateClips({
      contents: {
        ...state.contents,
        [id]: content,
      },
    });

    return id;
  }

  createAudioClip(buffer: Tone.ToneAudioBuffer): string {
    const id = uuidv4();
    const state = useEngineStore.getState().clips;
    const content: ClipContent = {
      id,
      type: "audio",
      name: `Audio Clip ${id.slice(0, 4)}`,
      buffer,
    };

    useEngineStore.getState().updateClips({
      contents: {
        ...state.contents,
        [id]: content,
      },
    });

    return id;
  }

  getClipContent(contentId: string): ClipContent | undefined {
    return useEngineStore.getState().clips.contents[contentId];
  }

  scheduleClip(clip: ArrangementClip): void {
    const state = useEngineStore.getState().clips;
    const content = this.getClipContent(clip.contentId);
    if (!content) return;

    if (content.type === "midi" && content.midiData) {
      // Create a Part for each MIDI track
      content.midiData.tracks.forEach((track) => {
        const synth = new Tone.PolySynth().toDestination();
        // Set the instrument based on track.instrument

        // Schedule notes
        const part = new Tone.Part((time, note: MidiNote) => {
          synth.triggerAttackRelease(
            note.name,
            note.duration,
            time,
            note.velocity,
          );
        }, track.notes).start(clip.startTime);

        // Handle control changes
        Object.values(track.controlChanges).forEach((changes) => {
          changes.forEach((cc) => {
            // Schedule control change events
            Tone.getTransport().schedule(
              (time) => {
                // todo: Handle control changes based on cc.number
                // example: handle modulation, expression, etc.
              },
              cc.time + Tone.Time(clip.startTime).toSeconds(),
            );
          });
        });

        if (clip.loop?.enabled) {
          part.loop = true;
          part.loopStart = clip.loop.start;
          part.loopEnd =
            Tone.Time(clip.loop.start).toSeconds() +
            Tone.Time(clip.loop.duration).toSeconds();
        }

        useEngineStore.getState().updateClips({
          activeClips: {
            ...state.activeClips,
            [clip.id]: { part, clip },
          },
        });
      });
    } else if (content.type === "audio" && content.buffer) {
      const player = new Tone.Player({
        url: content.buffer,
        loop: clip.loop?.enabled ?? false,
        loopStart: clip.loop?.start ?? 0,
        loopEnd:
          (Tone.Time(clip.loop?.start).toSeconds() ?? 0) +
          (Tone.Time(clip.loop?.duration).toSeconds() ?? 0),
      }).toDestination();

      player.start(clip.startTime);

      useEngineStore.getState().updateClips({
        activeClips: {
          ...state.activeClips,
          [clip.id]: { part: player, clip },
        },
      });
    }
  }

  unscheduleClip(clipId: string): void {
    const state = useEngineStore.getState();
    const activeClip = state.clips.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Part) {
        activeClip.part.dispose();
      } else if (activeClip.part instanceof Tone.Player) {
        activeClip.part.stop().dispose();
      }

      // Create new activeClips object without the specified clipId
      const { [clipId]: removed, ...remainingClips } = state.clips.activeClips;

      useEngineStore.getState().updateClips({
        activeClips: remainingClips,
      });
    }
  }

  setClipLoop(
    clipId: string,
    enabled: boolean,
    settings?: { start: Time; duration: Time },
  ): void {
    const state = useEngineStore.getState().clips;
    const activeClip = state.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Part) {
        activeClip.part.loop = enabled;
        if (settings) {
          activeClip.part.loopStart = settings.start;
          activeClip.part.loopEnd =
            Tone.Time(settings.start).toSeconds() +
            Tone.Time(settings.duration).toSeconds();
        }
      } else if (activeClip.part instanceof Tone.Player) {
        activeClip.part.loop = enabled;
        if (settings) {
          activeClip.part.loopStart = settings.start;
          activeClip.part.loopEnd =
            Tone.Time(settings.start).toSeconds() +
            Tone.Time(settings.duration).toSeconds();
        }
      }
    }
  }

  setClipGain(clipId: string, gain: Decibels): void {
    const state = useEngineStore.getState().clips;
    const activeClip = state.activeClips[clipId];

    if (activeClip && activeClip.part instanceof Tone.Player) {
      activeClip.part.volume.value = gain;
    }
  }

  setClipFades(clipId: string, fadeIn: Time, fadeOut: Time): void {
    const state = useEngineStore.getState().clips;
    const activeClip = state.activeClips[clipId];

    if (activeClip && activeClip.part instanceof Tone.Player) {
      activeClip.part.fadeIn = Tone.Time(fadeIn).toSeconds();
      activeClip.part.fadeOut = Tone.Time(fadeOut).toSeconds();
    }
  }

  playClip(clipId: string, startTime?: Time): void {
    const state = useEngineStore.getState().clips;
    const activeClip = state.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Player) {
        activeClip.part.start(startTime);
      } else if (activeClip.part instanceof Tone.Part) {
        activeClip.part.start(startTime);
      }
    }
  }

  stopClip(clipId: string): void {
    const state = useEngineStore.getState().clips;
    const activeClip = state.activeClips[clipId];

    if (activeClip) {
      if (activeClip.part instanceof Tone.Player) {
        activeClip.part.stop();
      } else if (activeClip.part instanceof Tone.Part) {
        activeClip.part.stop();
      }
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
