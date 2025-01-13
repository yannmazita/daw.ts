/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-empty-function */
// src/features/clips/services/ClipEngine.ts
import * as Tone from "tone";
import { ClipEngine, CompositionClip, ClipState } from "../types";
import { Midi } from "@tonejs/midi";
import {
  convertTimeFromSecondsToTicks,
  updateTransportTempo,
  updateTransportTimeSignature,
} from "@/features/transport/utils/midiUtils";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;

  async importMidi(
    state: ClipState,
    file: File,
    clipId?: string,
    trackId?: string,
  ): Promise<ClipState> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      if (clipId && trackId) {
        reject(new Error("ClipId and trackId cannot be provided together"));
        return;
      }

      reader.onload = (event) => {
        try {
          if (!event.target?.result) {
            reject(new Error("FileReader result is empty"));
            return;
          }

          const arrayBuffer = event.target.result as ArrayBuffer;
          const uint8Array = new Uint8Array(arrayBuffer);
          const midi = new Midi(uint8Array);

          // Update transport tempo and time signature
          updateTransportTempo(midi);
          updateTransportTimeSignature(midi);

          const newState = { ...state };
          if (clipId) {
            const clip = state.clips[clipId];
            newState.clips = {
              ...state.clips,
              [clipId]: {
                ...clip,
                data: midi,
              },
            };
          } else {
            const newClipId = crypto.randomUUID();
            const newClip: CompositionClip = {
              id: newClipId,
              parentId: trackId ?? "",
              name: file.name,
              type: "midi",
              data: midi,
              startTime: 0,
              pausedAt: 0,
              duration: 4,
              fadeIn: 0,
              fadeOut: 0,
              node: null,
            };
            newState.clips = {
              ...state.clips,
              [newClipId]: newClip,
            };
          }
          resolve(newState);
        } catch (error) {
          console.error("Error importing MIDI:", error);
          reject(new Error("Failed to import MIDI file"));
        }
      };

      reader.onerror = (error) => {
        console.error("FileReader error:", error);
        reject(new Error("Failed to read MIDI file"));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  exportMidi(state: ClipState, clipId: string): Midi {}

  createClip(
    state: ClipState,
    type: CompositionClip["type"],
    startTime: number,
    parentId: string,
    name?: string,
  ): ClipState {
    const clipId = crypto.randomUUID();
    const newClip: CompositionClip = {
      id: clipId,
      parentId,
      name: name ?? `Clip ${Object.keys(state.clips).length + 1}`,
      type,
      data: null,
      startTime: startTime,
      pausedAt: 0,
      duration: 4,
      fadeIn: 0,
      fadeOut: 0,
      node: null,
    };
    const newState = {
      ...state,
      clips: {
        ...state.clips,
        [clipId]: newClip,
      },
    };

    return newState;
  }

  deleteClip(state: ClipState, clipId: string): ClipState {
    const { [clipId]: clipToDelete, ...remainingClips } = state.clips;

    if (clipToDelete?.node) {
      if (clipToDelete.node instanceof Tone.Part) {
        clipToDelete.node.dispose();
      } else if (clipToDelete.node instanceof Tone.Player) {
        clipToDelete.node.dispose();
      }
    }

    return {
      ...state,
      clips: remainingClips,
    };
  }

  moveClip(state: ClipState, clipId: string, startTime: number): ClipState {
    return {
      ...state,
      clips: {
        ...state.clips,
        [clipId]: {
          ...state.clips[clipId],
          startTime,
        },
      },
    };
  }

  setClipFades(
    state: ClipState,
    clipId: string,
    fadeIn: number,
    fadeOut: number,
  ): ClipState {
    return {
      ...state,
      clips: {
        ...state.clips,
        [clipId]: {
          ...state.clips[clipId],
          fadeIn,
          fadeOut,
        },
      },
    };
  }

  playClip(state: ClipState, clipId: string, startTime?: number): ClipState {
    console.log("playClip called:", { clipId, startTime });
    const clip = state.clips[clipId];
    if (!clip?.data) {
      console.error(`Clip with id ${clipId} not found or has no data`);
      return state;
    }

    if (clip.node) {
      console.warn(
        `Clip with id ${clipId} already has a node, disposing of it`,
      );
      clip.node.dispose();
      clip.node = null;
    }

    try {
      if (clip.type === "midi" && clip.data instanceof Midi) {
        console.log("Playing MIDI clip:", clipId);
        const midi = clip.data;
        Tone.getTransport().PPQ = midi.header.ppq;

        // broken
        //convertTimeFromSecondsToTicks(midi);

        if (midi.tracks.length === 0) {
          console.warn("Midi file has no tracks");
          return state;
        }

        const synths: Tone.PolySynth[] = [];
        const now = Tone.now() + 0.5;

        midi.tracks.forEach((track) => {
          if (track.notes.length === 0) {
            console.warn("Midi track has no notes, skipping");
            return;
          }
          //create a synth for each track
          const synth = new Tone.PolySynth(Tone.Synth, {
            envelope: {
              attack: 0.02,
              decay: 0.1,
              sustain: 0.3,
              release: 1,
            },
          }).toDestination();
          synth.maxPolyphony = 256;
          synths.push(synth);
          //schedule all of the events
          track.notes.forEach((note) => {
            synth.triggerAttackRelease(
              note.name,
              note.duration,
              note.time + now,
              note.velocity,
            );
          });
        });
        clip.node = synths; // Store synths for disposal
        console.log("MIDI clip playback started:", clipId);
      } else if (
        clip.type === "audio" &&
        clip.data instanceof Tone.ToneAudioBuffer
      ) {
        console.log("Playing audio clip:", clipId);
        const player = new Tone.Player(clip.data).toDestination();
        player.start(startTime ?? clip.pausedAt);
        clip.node = player;
        clip.playerStartTime = startTime ?? clip.pausedAt; // Store the start time
        console.log("Audio clip playback started:", clipId);
      } else {
        console.error(`Clip with id ${clipId} has invalid data`);
      }
    } catch (error) {
      console.error("Error during clip playback:", error);
    }

    return state;
  }

  pauseClip(state: ClipState, clipId: string): ClipState {
    const clip = state.clips[clipId];
    if (!clip?.node) {
      console.error(`Clip with id ${clipId} not found`);
      return state;
    }

    if (Array.isArray(clip.node)) {
      clip.node.forEach((synth) => {
        synth.disconnect();
      });
    } else if (clip.node instanceof Tone.Player) {
      clip.node.stop();
      clip.node.dispose();
    }
    clip.node = null;

    return {
      ...state,
      clips: {
        ...state.clips,
        [clipId]: {
          ...clip,
          pausedAt: clip.node instanceof Tone.Player ? clip.node.now() : 0, // Store the pause time
          node: null,
        },
      },
    };
  }

  stopClip(state: ClipState, clipId: string): ClipState {
    const clip = state.clips[clipId];
    if (!clip?.node) {
      console.error(`Clip with id ${clipId} not found or not playing`);
      return state;
    }

    if (Array.isArray(clip.node)) {
      clip.node.forEach((synth) => {
        synth.disconnect();
      });
    } else if (clip.node instanceof Tone.Player) {
      clip.node.stop();
      clip.node.dispose();
    }
    clip.node = null;
    return state;
  }

  getClipPlaybackPosition(state: ClipState, clipId: string): number {
    const clip = state.clips[clipId];
    if (!clip?.node) {
      return 0;
    }

    if (clip.node instanceof Tone.Part) {
      return clip.node.progress;
    } else if (clip.node instanceof Tone.Player) {
      if (clip.playerStartTime === undefined) {
        return 0;
      }
      return clip.node.now() + clip.playerStartTime;
    }
    return 0;
  }

  dispose(state: ClipState): void {
    if (this.disposed) return;

    for (const clipId in state.clips) {
      this.stopClip(state, clipId);
    }

    this.disposed = true;
  }
}
