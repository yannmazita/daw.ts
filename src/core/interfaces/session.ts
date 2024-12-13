// src/core/interfaces/sessions.ts

import { LaunchQuantization, SceneState } from "../types/common";

export interface Scene {
  id: string;
  name: string;
  state: SceneState;
  tempo?: number; // Optional scene tempo
  timeSignature?: [number, number]; // Optional scene time signature
}

export interface SessionState {
  scenes: Scene[];
  currentSceneId: string | null;
  globalQuantization: LaunchQuantization;
  clipQuantization: LaunchQuantization;
}

export interface SessionActions {
  createScene(name: string): string;
  deleteScene(id: string): void;
  launchScene(id: string): void;
  stopScene(id: string): void;
  reorderScenes(sceneIds: string[]): void;
  setGlobalQuantization(value: LaunchQuantization): void;
  setClipQuantization(value: LaunchQuantization): void;
}
