// src/features/session/services/SessionManager.ts

import * as Tone from "tone";
import { BaseManager } from "@/common/services/BaseManager";
import { SessionState, SessionActions, Scene } from "@/core/interfaces/session";
import { transportManager } from "@/common/services/transportManagerInstance";
import { LaunchQuantization, SceneState } from "@/core/types/common";
import { Time } from "tone/build/esm/core/type/Units";
import { patternManager } from "@/features/patterns/services/patternManagerInstance";
import { Pattern } from "@/core/interfaces/pattern/index";

export class SessionManager extends BaseManager<SessionState> {
  private scheduledScenes: Map<string, number>;
  private nextQuantizeTime: Time | null;

  constructor() {
    super({
      scenes: [],
      currentSceneId: null,
      globalQuantization: LaunchQuantization.ONE_BAR,
      clipQuantization: LaunchQuantization.NONE,
    });

    this.scheduledScenes = new Map();
    this.nextQuantizeTime = null;
    this.setupQuantizationTimer();
  }

  private setupQuantizationTimer(): void {
    Tone.getTransport().scheduleRepeat((time) => {
      this.updateQuantizationTime(time);
    }, "16n");
  }

  private updateQuantizationTime(time: Time): void {
    const quantization = this.state.globalQuantization;
    if (quantization === LaunchQuantization.NONE) {
      this.nextQuantizeTime = Tone.now();
      return;
    }

    const currentBar = Tone.getTransport().position;
    const quantizeInterval = this.getQuantizeInterval(quantization);
    this.nextQuantizeTime = this.calculateNextQuantizeTime(
      currentBar,
      quantizeInterval,
    );
  }

  private getQuantizeInterval(quantization: LaunchQuantization): string {
    switch (quantization) {
      case LaunchQuantization.ONE_BAR:
        return "1m";
      case LaunchQuantization.TWO_BARS:
        return "2m";
      case LaunchQuantization.FOUR_BARS:
        return "4m";
      default:
        return "0";
    }
  }

  private calculateNextQuantizeTime(currentBar: Time, interval: string): Time {
    if (interval === "0") return Tone.now();

    const intervalSeconds = Tone.Time(interval).toSeconds();
    const currentSeconds = Tone.Time(currentBar).toSeconds();
    const nextInterval =
      Math.ceil(currentSeconds / intervalSeconds) * intervalSeconds;

    return nextInterval;
  }

  private cleanupPattern(pattern: Pattern): void {
    // Stop pattern playback
    if (pattern.part) {
      pattern.part.stop();
      pattern.part.cancel();
    }

    // Clear any scheduled follow actions
    if (pattern.followAction) {
      const scheduleId = this.scheduledScenes.get(pattern.id);
      if (scheduleId !== undefined) {
        Tone.getTransport().clear(scheduleId);
        this.scheduledScenes.delete(pattern.id);
      }
    }
  }

  private stopScenePatterns(sceneId: string): void {
    const patterns = patternManager.actions.getPatternsInScene(sceneId);

    patterns.forEach((pattern) => {
      this.cleanupPattern(pattern);
    });

    this.updateState({
      scenes: this.state.scenes.map((scene) =>
        scene.id === sceneId ? { ...scene, state: SceneState.STOPPED } : scene,
      ),
      currentSceneId:
        this.state.currentSceneId === sceneId
          ? null
          : this.state.currentSceneId,
    });
  }

  public readonly actions: SessionActions = {
    createScene: (name: string): string => {
      const scene: Scene = {
        id: `scene_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        state: SceneState.STOPPED,
      };

      this.updateState({
        scenes: [...this.state.scenes, scene],
      });

      return scene.id;
    },

    deleteScene: (id: string): void => {
      // Stop scene if playing
      if (this.state.currentSceneId === id) {
        this.actions.stopScene(id);
      }

      this.updateState({
        scenes: this.state.scenes.filter((scene) => scene.id !== id),
        currentSceneId:
          this.state.currentSceneId === id ? null : this.state.currentSceneId,
      });
    },

    launchScene: (id: string): void => {
      const scene = this.state.scenes.find((s) => s.id === id);
      if (!scene) return;

      // Calculate launch time based on quantization
      const launchTime = this.nextQuantizeTime ?? Tone.now();

      // Stop current scene if exists
      if (this.state.currentSceneId) {
        this.actions.stopScene(this.state.currentSceneId);
      }

      // Schedule scene launch
      const scheduleId = Tone.getTransport().schedule(() => {
        // Update tempo and time signature if specified
        if (scene.tempo) {
          transportManager.actions.setBpm(scene.tempo);
        }
        if (scene.timeSignature) {
          transportManager.actions.setTimeSignature(
            scene.timeSignature[0],
            scene.timeSignature[1],
          );
        }

        // Launch all patterns associated with this scene
        this.launchScenePatterns(scene);

        // Update scene state
        this.updateSceneState(id, SceneState.PLAYING);
      }, launchTime);

      this.scheduledScenes.set(id, scheduleId);
      this.updateSceneState(id, SceneState.QUEUED);
    },

    stopScene: (id: string): void => {
      // Clear scheduled launch if exists
      const scheduleId = this.scheduledScenes.get(id);
      if (scheduleId !== undefined) {
        Tone.getTransport().clear(scheduleId);
        this.scheduledScenes.delete(id);
      }

      // Stop all patterns in the scene
      this.stopScenePatterns(id);

      // Update scene state
      this.updateSceneState(id, SceneState.STOPPED);
    },

    reorderScenes: (sceneIds: string[]): void => {
      const orderedScenes = sceneIds
        .map((id) => this.state.scenes.find((s) => s.id === id))
        .filter((scene): scene is Scene => scene !== undefined);

      this.updateState({ scenes: orderedScenes });
    },

    setGlobalQuantization: (value: LaunchQuantization): void => {
      this.updateState({ globalQuantization: value });
    },

    setClipQuantization: (value: LaunchQuantization): void => {
      this.updateState({ clipQuantization: value });
    },
  };

  private launchScenePatterns(scene: Scene): void {
    const patterns = patternManager.actions.getPatternsInScene(scene.id);

    patterns.forEach((pattern) => {
      if (!pattern.sceneAssociation) return;

      // Calculate launch time based on clip quantization
      const launchTime =
        this.state.clipQuantization === LaunchQuantization.NONE
          ? this.nextQuantizeTime
          : this.calculateClipQuantizeTime(pattern);

      // Launch pattern at the calculated time
      if (pattern.part) {
        pattern.part.start(launchTime);
      }
    });
  }

  private calculateClipQuantizeTime(pattern: Pattern): Time {
    // Implementation of clip-specific quantization timing
    // This would take into account the clip's individual quantization setting
    // if it differs from the global setting
    return this.nextQuantizeTime ?? Tone.now();
  }

  private updateSceneState(id: string, state: SceneState): void {
    this.updateState({
      scenes: this.state.scenes.map((scene) =>
        scene.id === id ? { ...scene, state } : scene,
      ),
      currentSceneId: state === SceneState.PLAYING ? id : null,
    });
  }

  public dispose(): void {
    // Clean up all patterns in all scenes
    this.state.scenes.forEach((scene) => {
      const patterns = patternManager.actions.getPatternsInScene(scene.id);
      patterns.forEach((pattern) => {
        this.cleanupPattern(pattern);
      });
    });

    // Clear all scheduled events
    this.scheduledScenes.forEach((scheduleId) => {
      Tone.getTransport().clear(scheduleId);
    });
    this.scheduledScenes.clear();

    // Reset state
    this.updateState({
      scenes: [],
      currentSceneId: null,
      globalQuantization: LaunchQuantization.ONE_BAR,
      clipQuantization: LaunchQuantization.NONE,
    });
  }
}
