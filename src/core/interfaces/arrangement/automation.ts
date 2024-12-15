// src/core/interfaces/arrangement/automation.ts
import { Time } from "tone/build/esm/core/type/Units";
import { Disposable, Identifiable } from "../base";

export enum AutomationCurveType {
  LINEAR = "linear",
  EXPONENTIAL = "exponential",
  STEP = "step",
  SINE = "sine",
  COSINE = "cosine",
  HOLD = "hold",
}

export interface AutomationPoint extends Identifiable {
  time: Time;
  value: number;
  curveType: AutomationCurveType;
  tension?: number; // For curved interpolation
  bias?: number; // For curved interpolation
}

export interface AutomationLane extends Identifiable {
  trackId: string;
  parameterName: string;
  targetId: string; // ID of the target parameter (effect, instrument, etc.)
  points: AutomationPoint[];
  isVisible: boolean;
  height: number;
  color: string;
  minValue: number;
  maxValue: number;
  defaultValue: number;
  snapToGrid: boolean;
  snapToValue: boolean;
  valueSteps?: number[]; // For stepped parameters
}

export interface AutomationManagerState {
  lanes: Record<string, AutomationLane>;
  selectedLaneId: string | null;
  selectedPoints: string[];
}

export interface AutomationManagerActions {
  // Lane Management
  createLane(
    trackId: string,
    parameterName: string,
    targetId: string,
    config: Partial<AutomationLane>,
  ): string;
  deleteLane(laneId: string): void;
  updateLane(laneId: string, updates: Partial<AutomationLane>): void;
  toggleLaneVisibility(laneId: string): void;

  // Point Management
  addPoint(
    laneId: string,
    time: Time,
    value: number,
    curveType?: AutomationCurveType,
  ): string;
  removePoint(laneId: string, pointId: string): void;
  updatePoint(
    laneId: string,
    pointId: string,
    updates: Partial<Omit<AutomationPoint, "id">>,
  ): void;
  movePoint(
    laneId: string,
    pointId: string,
    newTime: Time,
    newValue: number,
  ): void;

  // Bulk Operations
  bulkAddPoints(
    laneId: string,
    points: Omit<AutomationPoint, "id">[],
  ): string[];
  bulkRemovePoints(laneId: string, pointIds: string[]): void;
  bulkUpdatePoints(
    laneId: string,
    updates: Record<string, Partial<Omit<AutomationPoint, "id">>>,
  ): void;

  // Selection
  selectLane(laneId: string | null): void;
  selectPoints(pointIds: string[]): void;
  clearSelection(): void;

  // Query and Utilities
  getLaneValue(laneId: string, time: Time): number;
  getLaneValuesInRange(
    laneId: string,
    startTime: Time,
    endTime: Time,
    resolution: Time,
  ): number[];
  getPointsInRange(
    laneId: string,
    startTime: Time,
    endTime: Time,
  ): AutomationPoint[];
  snapToGrid(time: Time): Time;
  snapToValue(value: number, laneId: string): number;
}

export interface AutomationManager extends Disposable {
  state: AutomationManagerState;
  actions: AutomationManagerActions;
}
