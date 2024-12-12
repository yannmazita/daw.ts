// src/features/session/services/SessionManager.ts

import * as Tone from "tone";
import { BaseManager } from "@/common/services/BaseManager";
import {
  SessionState,
  SessionActions,
  SessionTrackState,
  ClipSlot,
  SceneState,
} from "@/core/interfaces/session";
import {
  ClipState,
  LaunchQuantization,
  FollowActionConfig,
  FollowAction,
} from "@/core/types/common";
import { transportManager } from "@/common/services/transportManagerInstance";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { mixerManager } from "@/features/mixer/services/mixerManagerInstance";
import { Time } from "tone/build/esm/core/type/Units";
import { Pattern } from "@/core/interfaces/pattern";

export class SessionManager extends BaseManager<SessionState> {
  private activeClips: Map<string, Tone.Part>;
  private scheduledStops: Map<string, number>;
  private followActionTimeouts: Map<string, number>;

  constructor() {
    super({
      sessionTracks: [],
      scenes: [],
      clipLaunchQuantization: LaunchQuantization.ONE_BAR,
      selectedClipIds: new Set(),
    });

    this.activeClips = new Map();
    this.scheduledStops = new Map();
    this.followActionTimeouts = new Map();
  }

  public readonly actions: SessionActions = {
    // Track Management
    createTrack: (name: string): string => {
      const id = `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const mixerChannelId = mixerManager.actions.createChannel(name);

      const track: SessionTrackState = {
        id,
        name,
        mixerChannelId,
        clipSlots: [],
        isFolded: false,
        isArmed: false,
        monitoringMode: "auto",
      };

      this.updateState({
        sessionTracks: [...this.state.sessionTracks, track],
      });

      return id;
    },

    deleteTrack: (id: string): void => {
      const track = this.state.sessionTracks.find((t) => t.id === id);
      if (!track) return;

      // Stop all clips in track
      track.clipSlots.forEach((slot, index) => {
        if (
          slot.state === ClipState.PLAYING ||
          slot.state === ClipState.QUEUED
        ) {
          this.actions.stopClip(id, index);
        }
      });

      // Remove mixer channel
      mixerManager.actions.removeChannel(track.mixerChannelId);

      this.updateState({
        sessionTracks: this.state.sessionTracks.filter((t) => t.id !== id),
      });
    },

    updateTrack: (id: string, updates: Partial<SessionTrackState>): void => {
      this.updateState({
        sessionTracks: this.state.sessionTracks.map((track) =>
          track.id === id ? { ...track, ...updates } : track,
        ),
      });
    },

    moveTrack: (id: string, newIndex: number): void => {
      const sessionTracks = [...this.state.sessionTracks];
      const currentIndex = sessionTracks.findIndex((t) => t.id === id);
      if (currentIndex === -1) return;

      const [sessionTrack] = sessionTracks.splice(currentIndex, 1);
      sessionTracks.splice(newIndex, 0, sessionTrack);

      this.updateState({ sessionTracks });
    },

    // Clip Management
    createClip: (
      trackId: string,
      slotIndex: number,
      patternId: string,
    ): string => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      if (!track) throw new Error("Track not found");

      const pattern = patternManager.actions.getPattern(patternId);
      if (!pattern) throw new Error("Pattern not found");

      const clipId = `clip_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const clip: ClipSlot = {
        id: clipId,
        patternId,
        state: ClipState.STOPPED,
        name: pattern.name,
        color: pattern?.color,
        loopLength: pattern.defaultLoopLength ?? pattern.length,
      };

      const clipSlots = [...track.clipSlots];
      while (clipSlots.length <= slotIndex) {
        clipSlots.push({
          id: `empty_${clipSlots.length}`,
          patternId: null,
          state: ClipState.EMPTY,
        });
      }
      clipSlots[slotIndex] = clip;

      this.updateState({
        sessionTracks: this.state.sessionTracks.map((t) =>
          t.id === trackId ? { ...t, clipSlots } : t,
        ),
      });

      return clipId;
    },

    deleteClip: (trackId: string, slotIndex: number): void => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      if (!track?.clipSlots[slotIndex]) return;

      const clip = track.clipSlots[slotIndex];
      if (clip.state === ClipState.PLAYING || clip.state === ClipState.QUEUED) {
        this.actions.stopClip(trackId, slotIndex);
      }

      const clipSlots = [...track.clipSlots];
      clipSlots[slotIndex] = {
        id: `empty_${slotIndex}`,
        patternId: null,
        state: ClipState.EMPTY,
      };

      this.updateState({
        sessionTracks: this.state.sessionTracks.map((t) =>
          t.id === trackId ? { ...t, clipSlots } : t,
        ),
      });
    },

    updateClip: (
      trackId: string,
      slotIndex: number,
      updates: Partial<ClipSlot>,
    ): void => {
      this.updateState({
        sessionTracks: this.state.sessionTracks.map((track) =>
          track.id === trackId
            ? {
                ...track,
                clipSlots: track.clipSlots.map((slot, index) =>
                  index === slotIndex ? { ...slot, ...updates } : slot,
                ),
              }
            : track,
        ),
      });
    },

    duplicateClip: (
      sourceTrackId: string,
      sourceSlotIndex: number,
      targetTrackId: string,
      targetSlotIndex: number,
    ): string => {
      const sourceTrack = this.state.sessionTracks.find(
        (t) => t.id === sourceTrackId,
      );
      if (!sourceTrack) throw new Error("Source track not found");

      const sourceClip = sourceTrack.clipSlots[sourceSlotIndex];
      if (!sourceClip.patternId) throw new Error("Source clip is empty");

      // Duplicate the pattern first
      const newPatternId = patternManager.actions.duplicatePattern(
        sourceClip.patternId,
      );

      // Create new clip with duplicated pattern
      return this.actions.createClip(
        targetTrackId,
        targetSlotIndex,
        newPatternId,
      );
    },

    // Scene Management
    createScene: (name: string): string => {
      const id = `scene_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const scene: SceneState = {
        id,
        name,
      };

      this.updateState({
        scenes: [...this.state.scenes, scene],
      });

      return id;
    },

    deleteScene: (id: string): void => {
      this.updateState({
        scenes: this.state.scenes.filter((s) => s.id !== id),
      });
    },

    updateScene: (id: string, updates: Partial<SceneState>): void => {
      this.updateState({
        scenes: this.state.scenes.map((scene) =>
          scene.id === id ? { ...scene, ...updates } : scene,
        ),
      });
    },

    moveScene: (id: string, newIndex: number): void => {
      const scenes = [...this.state.scenes];
      const currentIndex = scenes.findIndex((s) => s.id === id);
      if (currentIndex === -1) return;

      const [scene] = scenes.splice(currentIndex, 1);
      scenes.splice(newIndex, 0, scene);

      this.updateState({ scenes });
    },

    // Playback Control
    launchClip: (trackId: string, slotIndex: number) => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      if (!track) return;

      const clip = track.clipSlots[slotIndex];
      if (!clip.patternId) return;

      const pattern = patternManager.actions.getPattern(clip.patternId);
      if (!pattern) return;

      // Calculate launch time based on quantization
      const quantizedTime = this.getQuantizedLaunchTime();

      // Update clip state to queued
      this.actions.updateClip(trackId, slotIndex, { state: ClipState.QUEUED });

      // Stop other clips in the same track
      track.clipSlots.forEach((slot, index) => {
        if (
          index !== slotIndex &&
          (slot.state === ClipState.PLAYING || slot.state === ClipState.QUEUED)
        ) {
          this.actions.stopClip(trackId, index);
        }
      });

      // Create and schedule the clip playback
      const part = new Tone.Part((time, event) => {
        // Handle note or audio event playback
        if (event.type === "note") {
          // Find corresponding track in pattern and trigger note
          const patternTrack = pattern.tracks.find(
            (t) => t.id === event.trackId,
          );
          if (patternTrack?.instrument) {
            patternTrack.instrument.triggerAttackRelease(
              event.note,
              event.duration || "8n",
              time,
              event.velocity || 1,
            );
          }
        }
      }, this.flattenPatternEvents(pattern));

      // Configure part
      part.loop = true;
      part.loopStart = clip.startTime ?? 0;
      part.loopEnd = clip.loopLength ?? pattern.length;

      // Schedule start
      part.start(quantizedTime);

      // Store active clip
      this.activeClips.set(clip.id, part);

      // Update clip state to playing
      this.actions.updateClip(trackId, slotIndex, { state: ClipState.PLAYING });

      // Schedule follow action if configured
      if (clip.followAction) {
        this.scheduleFollowAction(trackId, slotIndex, clip.followAction);
      }
    },

    stopClip: (trackId: string, slotIndex: number): void => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      if (!track) return;

      const clip = track.clipSlots[slotIndex];
      if (!clip) return;

      // Clear follow action if scheduled
      const followTimeout = this.followActionTimeouts.get(clip.id);
      if (followTimeout) {
        clearTimeout(followTimeout);
        this.followActionTimeouts.delete(clip.id);
      }

      // Stop and cleanup active clip
      const activePart = this.activeClips.get(clip.id);
      if (activePart) {
        activePart.stop();
        activePart.dispose();
        this.activeClips.delete(clip.id);
      }

      // Update clip state
      this.actions.updateClip(trackId, slotIndex, { state: ClipState.STOPPED });
    },

    launchScene: async (sceneIndex: number): Promise<void> => {
      const scene = this.state.scenes[sceneIndex];
      if (!scene) return;

      // Stop all currently playing clips
      this.actions.stopAllClips();

      // Launch clips for each track at the scene index
      await Promise.all(
        this.state.sessionTracks.map((track) => {
          const clip = track.clipSlots[sceneIndex];
          if (clip?.patternId) {
            return this.actions.launchClip(track.id, sceneIndex);
          }
          return Promise.resolve();
        }),
      );

      // Handle scene follow action if configured
      if (this.state.sceneFollowAction) {
        this.scheduleSceneFollowAction(
          sceneIndex,
          this.state.sceneFollowAction,
        );
      }
    },

    stopScene: (sceneIndex: number): void => {
      this.state.sessionTracks.forEach((track) => {
        const clip = track.clipSlots[sceneIndex];
        if (
          clip &&
          (clip.state === ClipState.PLAYING || clip.state === ClipState.QUEUED)
        ) {
          this.actions.stopClip(track.id, sceneIndex);
        }
      });
    },

    stopAllClips: (): void => {
      this.state.sessionTracks.forEach((track) => {
        track.clipSlots.forEach((clip, index) => {
          if (
            clip.state === ClipState.PLAYING ||
            clip.state === ClipState.QUEUED
          ) {
            this.actions.stopClip(track.id, index);
          }
        });
      });
    },

    // Recording
    armTrack: (trackId: string, armed: boolean): void => {
      this.actions.updateTrack(trackId, { isArmed: armed });
    },

    setMonitoring: (trackId: string, mode: "in" | "auto" | "off"): void => {
      this.actions.updateTrack(trackId, { monitoringMode: mode });
    },

    recordIntoSlot: (trackId: string, slotIndex: number): void => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      if (!track?.isArmed) return;

      // Create new pattern for recording
      const patternId = patternManager.actions.createPattern(
        `Recording ${Date.now()}`,
        transportManager.getState().timeSignature,
      );

      // Create clip
      const clipId = this.actions.createClip(trackId, slotIndex, patternId);

      // Update clip state to recording
      this.actions.updateClip(trackId, slotIndex, {
        state: ClipState.RECORDING,
      });

      // Todo: recording logic
    },

    // Selection and Focus
    setFocusedTrack: (trackId: string | undefined): void => {
      this.updateState({ focusedTrackId: trackId });
    },

    setFocusedClip: (clipId: string | undefined): void => {
      this.updateState({ focusedClipId: clipId });
    },

    selectClip: (clipId: string, addToSelection = false): void => {
      const newSelection = addToSelection
        ? new Set([...this.state.selectedClipIds, clipId])
        : new Set([clipId]);
      this.updateState({ selectedClipIds: newSelection });
    },

    deselectClip: (clipId: string): void => {
      const newSelection = new Set(this.state.selectedClipIds);
      newSelection.delete(clipId);
      this.updateState({ selectedClipIds: newSelection });
    },

    clearSelection: (): void => {
      this.updateState({ selectedClipIds: new Set() });
    },

    // Configuration
    setClipLaunchQuantization: (quantization: LaunchQuantization): void => {
      this.updateState({ clipLaunchQuantization: quantization });
    },

    setSceneFollowAction: (config: FollowActionConfig | undefined): void => {
      this.updateState({ sceneFollowAction: config });
    },

    // Utility Methods
    getClipAt: (trackId: string, slotIndex: number): ClipSlot | null => {
      const track = this.state.sessionTracks.find((t) => t.id === trackId);
      return track?.clipSlots[slotIndex] ?? null;
    },

    getTrack: (id: string): SessionTrackState | undefined => {
      return this.state.sessionTracks.find((t) => t.id === id);
    },

    getScene: (id: string): SceneState | undefined => {
      return this.state.scenes.find((s) => s.id === id);
    },

    dispose: (): void => {
      this.actions.stopAllClips();
      this.activeClips.clear();
      this.scheduledStops.clear();
      this.followActionTimeouts.clear();
      this.updateState({
        sessionTracks: [],
        scenes: [],
        selectedClipIds: new Set(),
      });
    },
  };

  // Private Helper Methods
  private getQuantizedLaunchTime(): Time {
    const transport = Tone.getTransport();
    const currentBar = Math.floor(transport.position as number);
    const quantization = this.state.clipLaunchQuantization;

    switch (quantization) {
      case LaunchQuantization.NONE:
        return transport.seconds;
      case LaunchQuantization.ONE_BAR:
        return `${currentBar + 1}:0:0`;
      case LaunchQuantization.TWO_BARS:
        return `${currentBar + (currentBar % 2 === 0 ? 2 : 1)}:0:0`;
      case LaunchQuantization.FOUR_BARS:
        return `${currentBar + (4 - (currentBar % 4))}:0:0`;
      default:
        return transport.seconds;
    }
  }

  private scheduleFollowAction(
    trackId: string,
    slotIndex: number,
    config: FollowActionConfig,
  ): void {
    const clip = this.actions.getClipAt(trackId, slotIndex);
    if (!clip) return;

    const timeout = setTimeout(() => {
      if (Math.random() <= config.chance) {
        switch (config.action) {
          case FollowAction.STOP:
            this.actions.stopClip(trackId, slotIndex);
            break;
          case FollowAction.NEXT:
            this.actions.launchClip(trackId, slotIndex + 1);
            break;
          case FollowAction.PREVIOUS:
            this.actions.launchClip(trackId, slotIndex - 1);
            break;
          case FollowAction.FIRST:
            this.actions.launchClip(trackId, 0);
            break;
          case FollowAction.LAST: {
            const track = this.actions.getTrack(trackId);
            if (track) {
              this.actions.launchClip(trackId, track.clipSlots.length - 1);
            }
            break;
          }
          case FollowAction.ANY: {
            const track = this.actions.getTrack(trackId);
            if (track) {
              const randomIndex = Math.floor(
                Math.random() * track.clipSlots.length,
              );
              this.actions.launchClip(trackId, randomIndex);
            }
            break;
          }
          case FollowAction.OTHER:
            if (config.targetClipId) {
              // Find target clip and launch it
              this.state.sessionTracks.forEach((track, trackIndex) => {
                track.clipSlots.forEach((slot, slotIndex) => {
                  if (slot.id === config.targetClipId) {
                    this.actions.launchClip(track.id, slotIndex);
                  }
                });
              });
            }
            break;
        }
      }
    }, Tone.Time(config.time).toMilliseconds());

    this.followActionTimeouts.set(clip.id, timeout);
  }

  private scheduleSceneFollowAction(
    currentSceneIndex: number,
    config: FollowActionConfig,
  ): void {
    if (Math.random() <= config.chance) {
      setTimeout(() => {
        this.executeFollowAction(currentSceneIndex, config).catch((error) =>
          console.error("Error executing follow action:", error),
        );
      }, Tone.Time(config.time).toMilliseconds());
    }
  }

  private async executeFollowAction(
    currentSceneIndex: number,
    config: FollowActionConfig,
  ): Promise<void> {
    switch (config.action) {
      case FollowAction.STOP:
        await this.actions.launchScene(currentSceneIndex + 1);
        break;
      case FollowAction.NEXT:
        await this.actions.launchScene(currentSceneIndex - 1);
        break;
      case FollowAction.FIRST:
      case FollowAction.PREVIOUS:
        await this.actions.launchScene(0);
        break;
      case FollowAction.LAST:
        await this.actions.launchScene(this.state.scenes.length - 1);
        break;
      case FollowAction.ANY: {
        const randomIndex = Math.floor(
          Math.random() * this.state.scenes.length,
        );
        await this.actions.launchScene(randomIndex);
        break;
      }
      default:
        console.warn(`Unhandled action type: ${config.action}`);
    }
  }

  private flattenPatternEvents(pattern: Pattern): Array<any> {
    return pattern.tracks.flatMap((track) =>
      track.events.map((event) => ({
        ...event,
        trackId: track.id,
      })),
    );
  }
}
