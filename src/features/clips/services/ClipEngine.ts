// src/features/clips/services/ClipEngine.ts
import { Part, Player, ToneAudioBuffer, Time, isDefined } from "tone";
import { v4 as uuidv4 } from "uuid";
import {
  ArrangementClip,
  ClipContent,
  ClipEngine,
  ClipLoop,
  ClipState,
  MidiNote,
} from "../types";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class ClipEngineImpl implements ClipEngine {
  private store;

  constructor() {
    this.store = useEngineStore;
  }

  createMidiClip(notes: MidiNote[]): string {
    const id = uuidv4();
    this.store.getState().updateClips({
      contents: {
        ...this.store.getState().clips.contents,
        [id]: { id, type: "midi", name: `Midi Clip ${id}`, notes },
      },
    });
    return id;
  }

  createAudioClip(buffer: ToneAudioBuffer): string {
    const id = uuidv4();
    this.store.getState().updateClips({
      contents: {
        ...this.store.getState().clips.contents,
        [id]: { id, type: "audio", name: `Audio Clip ${id}`, buffer },
      },
    });
    return id;
  }

  getClipContent(contentId: string): ClipContent | undefined {
    return this.store.getState().clips.contents[contentId];
  }

  scheduleClip(clip: ArrangementClip): void {
    const content = this.getClipContent(clip.contentId);
    if (!content) {
      console.error("Clip content not found");
      return;
    }

    if (this.store.getState().clips.activeClips[clip.id]) {
      this.unscheduleClip(clip.id);
    }

    let partOrPlayer: Part | Player;
    if (content.type === "midi" && content.notes) {
      partOrPlayer = new Part((time, note) => {
        // Trigger the note here (e.g., using a synth)
        // For now, just logging
        console.log("midi note played", note.note, time);
      }, content.notes).start(clip.startTime);
    } else if (content.type === "audio" && content.buffer) {
      partOrPlayer = new Player(content.buffer).start(clip.startTime);
      if (clip.loop?.enabled) {
        partOrPlayer.loop = true;
        partOrPlayer.loopStart = clip.loop.start;
        partOrPlayer.loopEnd =
          Time(clip.loop.start).toSeconds() +
          Time(clip.loop.duration).toSeconds();
      }
    } else {
      console.error("Invalid clip content");
      return;
    }

    this.store.getState().updateClips({
      activeClips: {
        ...this.store.getState().clips.activeClips,
        [clip.id]: { part: partOrPlayer, clip },
      },
    });
  }

  unscheduleClip(clipId: string): void {
    const activeClip = this.store.getState().clips.activeClips[clipId];
    if (activeClip) {
      activeClip.part.dispose();
      const currentActiveClips = this.store.getState().clips.activeClips;

      const { [clipId]: _, ...newActiveClips } = currentActiveClips;
      this.store.getState().updateClips({ activeClips: newActiveClips });
    }
  }

  setClipLoop(clipId: string, enabled: boolean, settings?: ClipLoop): void {
    this.store.getState().updateArrangement({
      clips: {
        ...this.store.getState().arrangement.clips,
        [clipId]: {
          ...this.store.getState().arrangement.clips[clipId],
          loop: enabled ? settings : undefined,
        },
      },
    });

    const activeClip = this.store.getState().clips.activeClips[clipId];
    if (activeClip?.clip.contentId) {
      const content = this.getClipContent(activeClip.clip.contentId);
      if (
        content?.type === "audio" &&
        content?.buffer &&
        activeClip.part instanceof Player
      ) {
        activeClip.part.loop = enabled;
        if (settings) {
          activeClip.part.loopStart = settings.start;
          activeClip.part.loopEnd =
            Time(settings.start).toSeconds() +
            Time(settings.duration).toSeconds();
        }
      }
    }
  }

  setClipGain(clipId: string, gain: number): void {
    this.store.getState().updateArrangement({
      clips: {
        ...this.store.getState().arrangement.clips,
        [clipId]: {
          ...this.store.getState().arrangement.clips[clipId],
          gain,
        },
      },
    });
  }

  setClipFades(clipId: string, fadeIn: number, fadeOut: number): void {
    this.store.getState().updateArrangement({
      clips: {
        ...this.store.getState().arrangement.clips,
        [clipId]: {
          ...this.store.getState().arrangement.clips[clipId],
          fadeIn,
          fadeOut,
        },
      },
    });
  }

  playClip(clipId: string, startTime?: number): void {
    const clip = this.store.getState().arrangement.clips[clipId];
    if (!clip) return;
    const content = this.getClipContent(clip.contentId);
    if (!content) return;
    if (content.type === "audio" && content.buffer) {
      const player = new Player(content.buffer).toDestination();
      if (clip.loop?.enabled) {
        player.loop = true;
        player.loopStart = clip.loop.start;
        player.loopEnd =
          Time(clip.loop.start).toSeconds() +
          Time(clip.loop.duration).toSeconds();
      }
      player.start(startTime);
    }
  }

  stopClip(clipId: string): void {
    const activeClip = this.store.getState().clips.activeClips[clipId];
    if (activeClip && activeClip.part instanceof Player) {
      activeClip.part.stop();
    }
  }

  isClipPlaying(clipId: string): boolean {
    const activeClip = this.store.getState().clips.activeClips[clipId];
    return isDefined(activeClip) && activeClip.part.state === "started";
  }

  getPlaybackPosition(clipId: string): number {
    const activeClip = this.store.getState().clips.activeClips[clipId];
    if (activeClip && activeClip.part instanceof Player) {
      return activeClip.part.now();
    }
    return 0;
  }

  getState(): ClipState {
    return this.store.getState().clips;
  }

  dispose(): void {
    Object.values(this.store.getState().clips.activeClips).forEach(
      (activeClip) => activeClip.part.dispose(),
    );
  }
}
