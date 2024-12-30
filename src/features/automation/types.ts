// src/features/automation/types.ts
import { Param } from "tone";
import { Time } from "tone/build/esm/core/type/Units";

export interface AutomationPoint {
  id: string;
  time: Time;
  value: number;
  curve: "linear" | "exponential" | "step";
}

export interface AutomationLane {
  id: string;
  targetType: "device" | "mixer" | "clip";
  targetId: string;
  parameterId: string;
  points: AutomationPoint[];
}

export interface AutomationState {
  lanes: Record<string, AutomationLane>;
  activeAutomation: Record<
    string,
    {
      param: Param<any>;
      points: AutomationPoint[];
    }
  >;
}

export interface PersistableAutomationState {
  lanes: Record<string, AutomationLane>;
  activeAutomation: Record<
    string,
    {
      points: AutomationPoint[];
    }
  >;
}

export interface AutomationEngine {
  createLane(targetType: string, targetId: string, parameterId: string): string;
  deleteLane(laneId: string): void;

  addPoint(
    laneId: string,
    time: Time,
    value: number,
    curve?: AutomationPoint["curve"],
  ): string;
  removePoint(laneId: string, pointId: string): void;
  updatePoint(
    laneId: string,
    pointId: string,
    updates: Partial<AutomationPoint>,
  ): void;

  scheduleLane(laneId: string): void;
  unscheduleLane(laneId: string): void;

  // State
  getState(): AutomationState;
  dispose(): void;
}
