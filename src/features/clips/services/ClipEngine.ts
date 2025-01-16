// src/features/clips/services/ClipEngine.ts
import * as Tone from "tone";
import { ClipEngine, CompositionClip, ClipState } from "../types";
import { Midi } from "@tonejs/midi";
import {
  updateTransportTempo,
  updateTransportTimeSignature,
} from "@/features/transport/utils/midiUtils";
import { startAudioPlayback } from "../utils/playbackUtils";
import { SamplerEngine } from "@/features/sampler/types";
import { EngineState } from "@/core/stores/useEngineStore";

export class ClipEngineImpl implements ClipEngine {
  private disposed = false;

  constructor(private samplerEngine: SamplerEngine) {}

  async importMidi(
    state: ClipState,
    file: File,
    clipId?: string,
    trackId?: string,
    instrumentId?: string,
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
                instrumentId: instrumentId,
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
              instrumentId: instrumentId,
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
    instrumentId?: string,
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
      instrumentId: instrumentId,
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
      } else if (clipToDelete.node instanceof Tone.Sampler) {
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

  playClip(
    state: EngineState,
    clipId: string,
    startTime?: number,
  ): EngineState {
    const clip = state.clips.clips[clipId];
    if (!clip?.data) {
      console.error(`Clip with id ${clipId} not found or has no data`);
      return state;
    }

    if (clip.node) {
      this.disposeNode(clip.node);
      clip.node = null;
    }

    try {
      if (clip.type === "midi" && clip.data instanceof Midi) {
        return this.samplerEngine.startSamplerPlayback(
          state,
          clipId,
          startTime,
        );
      } else if (
        clip.type === "audio" &&
        clip.data instanceof Tone.ToneAudioBuffer
      ) {
        const newClipState = startAudioPlayback(state.clips, clip, startTime);
        return { ...state, clips: newClipState };
      } else {
        console.error(`Clip with id ${clipId} has invalid data`);
        return state;
      }
    } catch (error) {
      console.error("Error during clip playback:", error);
      return state;
    }
  }

  pauseClip(state: ClipState, clipId: string): ClipState {
    const clip = state.clips[clipId];
    if (!clip?.node) {
      console.error(`Clip with id ${clipId} not found`);
      return state;
    }
    let pausedAt = 0;
    if (clip.node instanceof Tone.Player) {
      pausedAt = clip.node.now();
    }
    this.disposeNode(clip.node);

    return {
      ...state,
      clips: {
        ...state.clips,
        [clipId]: {
          ...clip,
          pausedAt: pausedAt,
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

    this.disposeNode(clip.node);
    clip.node = null;
    return state;
  }

  getClipPlaybackPosition(state: ClipState, clipId: string): number {
    const clip = state.clips[clipId];
    if (!clip?.node) {
      return 0;
    }

    if (clip.node instanceof Tone.Player) {
      if (clip.playerStartTime === undefined) {
        return 0;
      }
      return clip.node.now() + clip.playerStartTime;
    } else if (Array.isArray(clip.node)) {
      // For MIDI clips, return 0 for now as we don't have a single progress value
      return 0;
    }
    return 0;
  }

  private disposeNode(
    node: Tone.Player | Tone.PolySynth[] | Tone.Sampler | null,
  ) {
    if (Array.isArray(node)) {
      node.forEach((synth) => {
        synth.disconnect();
        synth.dispose();
      });
    } else if (node instanceof Tone.Player) {
      node.stop();
      node.dispose();
    } else if (node instanceof Tone.Sampler) {
      node.dispose();
    }
  }

  dispose(state: ClipState): void {
    if (this.disposed) return;

    for (const clipId in state.clips) {
      this.stopClip(state, clipId);
    }
    this.disposed = true;
  }
}
