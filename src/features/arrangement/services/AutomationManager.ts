// src/features/arrangement/services/AutomationManager.ts
import * as Tone from "tone";
import {
  AutomationManager,
  AutomationManagerState,
  AutomationManagerActions,
  AutomationLane,
  AutomationPoint,
  AutomationCurveType,
} from "@/core/interfaces/arrangement/automation";
import { BaseManager } from "@/common/services/BaseManager";
import { Time } from "tone/build/esm/core/type/Units";

export class ArrangementAutomationManager
  extends BaseManager<AutomationManagerState>
  implements AutomationManager
{
  private readonly MIN_LANE_HEIGHT = 40;
  private readonly MAX_LANE_HEIGHT = 200;
  private readonly DEFAULT_LANE_HEIGHT = 100;
  private readonly MAX_POINTS_PER_LANE = 1000;

  constructor() {
    super({
      lanes: {},
      selectedLaneId: null,
      selectedPoints: [],
    });
  }

  public readonly actions: AutomationManagerActions = {
    // Lane Management
    createLane: (
      trackId: string,
      parameterName: string,
      targetId: string,
      config: Partial<AutomationLane>,
    ): string => {
      const id = `automation_lane_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

      const lane: AutomationLane = {
        id,
        name: `${parameterName} Automation`,
        trackId,
        parameterName,
        targetId,
        points: [],
        isVisible: true,
        height: this.DEFAULT_LANE_HEIGHT,
        color: this.generateColor(),
        minValue: 0,
        maxValue: 1,
        defaultValue: 0,
        snapToGrid: true,
        snapToValue: false,
        ...config,
      };

      this.updateState({
        lanes: {
          ...this.state.lanes,
          [id]: lane,
        },
      });

      return id;
    },

    deleteLane: (laneId: string): void => {
      const { [laneId]: _, ...remainingLanes } = this.state.lanes;

      this.updateState({
        lanes: remainingLanes,
        selectedLaneId:
          this.state.selectedLaneId === laneId
            ? null
            : this.state.selectedLaneId,
        selectedPoints: this.state.selectedPoints.filter(
          (pointId) =>
            !this.state.lanes[laneId]?.points.find((p) => p.id === pointId),
        ),
      });
    },

    updateLane: (laneId: string, updates: Partial<AutomationLane>): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      this.updateState({
        lanes: {
          ...this.state.lanes,
          [laneId]: {
            ...lane,
            ...updates,
            height: updates.height
              ? Math.max(
                  this.MIN_LANE_HEIGHT,
                  Math.min(this.MAX_LANE_HEIGHT, updates.height),
                )
              : lane.height,
          },
        },
      });
    },

    toggleLaneVisibility: (laneId: string): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      this.actions.updateLane(laneId, { isVisible: !lane.isVisible });
    },

    // Point Management
    addPoint: (
      laneId: string,
      time: Time,
      value: number,
      curveType: AutomationCurveType = AutomationCurveType.LINEAR,
    ): string => {
      const lane = this.state.lanes[laneId];
      if (!lane) throw new Error("Lane not found");

      if (lane.points.length >= this.MAX_POINTS_PER_LANE) {
        throw new Error("Maximum number of points reached for this lane");
      }

      const snappedTime = lane.snapToGrid
        ? this.actions.snapToGrid(time)
        : time;
      const snappedValue = lane.snapToValue
        ? this.actions.snapToValue(value, laneId)
        : this.clampValue(value, lane);

      const point: AutomationPoint = {
        id: `automation_point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: `Point at ${Tone.Time(snappedTime).toBarsBeatsSixteenths()}`,
        time: snappedTime,
        value: snappedValue,
        curveType,
      };

      const newPoints = [...lane.points, point].sort(
        (a, b) => Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
      );

      this.actions.updateLane(laneId, { points: newPoints });

      return point.id;
    },

    removePoint: (laneId: string, pointId: string): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      this.actions.updateLane(laneId, {
        points: lane.points.filter((p) => p.id !== pointId),
      });

      this.updateState({
        selectedPoints: this.state.selectedPoints.filter(
          (id) => id !== pointId,
        ),
      });
    },

    updatePoint: (
      laneId: string,
      pointId: string,
      updates: Partial<Omit<AutomationPoint, "id">>,
    ): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      const pointIndex = lane.points.findIndex((p) => p.id === pointId);
      if (pointIndex === -1) return;

      const updatedPoint = {
        ...lane.points[pointIndex],
        ...updates,
        value:
          updates.value !== undefined
            ? this.clampValue(updates.value, lane)
            : lane.points[pointIndex].value,
      };

      const newPoints = [...lane.points];
      newPoints[pointIndex] = updatedPoint;

      if (updates.time !== undefined) {
        newPoints.sort(
          (a, b) =>
            Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
        );
      }

      this.actions.updateLane(laneId, { points: newPoints });
    },

    movePoint: (
      laneId: string,
      pointId: string,
      newTime: Time,
      newValue: number,
    ): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      const snappedTime = lane.snapToGrid
        ? this.actions.snapToGrid(newTime)
        : newTime;
      const snappedValue = lane.snapToValue
        ? this.actions.snapToValue(newValue, laneId)
        : this.clampValue(newValue, lane);

      this.actions.updatePoint(laneId, pointId, {
        time: snappedTime,
        value: snappedValue,
      });
    },

    // Bulk Operations
    bulkAddPoints: (
      laneId: string,
      points: Omit<AutomationPoint, "id">[],
    ): string[] => {
      const lane = this.state.lanes[laneId];
      if (!lane) throw new Error("Lane not found");

      if (lane.points.length + points.length > this.MAX_POINTS_PER_LANE) {
        throw new Error("Adding these points would exceed the maximum limit");
      }

      const newPointIds: string[] = [];
      const newPoints = points.map((point) => {
        const id = `automation_point_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        newPointIds.push(id);
        return {
          ...point,
          id,
          name: `Point at ${Tone.Time(point.time).toBarsBeatsSixteenths()}`,
          value: this.clampValue(point.value, lane),
        };
      });

      const mergedPoints = [...lane.points, ...newPoints].sort(
        (a, b) => Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
      );

      this.actions.updateLane(laneId, { points: mergedPoints });

      return newPointIds;
    },

    bulkRemovePoints: (laneId: string, pointIds: string[]): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      this.actions.updateLane(laneId, {
        points: lane.points.filter((p) => !pointIds.includes(p.id)),
      });

      this.updateState({
        selectedPoints: this.state.selectedPoints.filter(
          (id) => !pointIds.includes(id),
        ),
      });
    },

    bulkUpdatePoints: (
      laneId: string,
      updates: Record<string, Partial<Omit<AutomationPoint, "id">>>,
    ): void => {
      const lane = this.state.lanes[laneId];
      if (!lane) return;

      const newPoints = lane.points.map((point) => {
        const pointUpdates = updates[point.id];
        if (!pointUpdates) return point;

        return {
          ...point,
          ...pointUpdates,
          value:
            pointUpdates.value !== undefined
              ? this.clampValue(pointUpdates.value, lane)
              : point.value,
        };
      });

      // Sort if any time values were updated
      if (Object.values(updates).some((update) => update.time !== undefined)) {
        newPoints.sort(
          (a, b) =>
            Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
        );
      }

      this.actions.updateLane(laneId, { points: newPoints });
    },

    // Selection
    selectLane: (laneId: string | null): void => {
      this.updateState({ selectedLaneId: laneId });
    },

    selectPoints: (pointIds: string[]): void => {
      this.updateState({ selectedPoints: pointIds });
    },

    clearSelection: (): void => {
      this.updateState({
        selectedLaneId: null,
        selectedPoints: [],
      });
    },

    // Query and Utilities
    getLaneValue: (laneId: string, time: Time): number => {
      const lane = this.state.lanes[laneId];
      if (!lane) return 0;

      const timeSeconds = Tone.Time(time).toSeconds();
      const points = lane.points;

      if (points.length === 0) return lane.defaultValue;
      if (points.length === 1) return points[0].value;

      // Find surrounding points
      let prevPoint: AutomationPoint | null = null;
      let nextPoint: AutomationPoint | null = null;

      for (let i = 0; i < points.length; i++) {
        const pointTime = Tone.Time(points[i].time).toSeconds();
        if (pointTime > timeSeconds) {
          nextPoint = points[i];
          prevPoint = points[i - 1] || null;
          break;
        }
      }

      if (!prevPoint) return points[0].value;
      if (!nextPoint) return points[points.length - 1].value;

      return this.interpolateValue(prevPoint, nextPoint, timeSeconds);
    },

    getLaneValuesInRange: (
      laneId: string,
      startTime: Time,
      endTime: Time,
      resolution: Time,
    ): number[] => {
      const values: number[] = [];
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();
      const step = Tone.Time(resolution).toSeconds();

      for (let time = start; time <= end; time += step) {
        values.push(this.actions.getLaneValue(laneId, time));
      }

      return values;
    },

    getPointsInRange: (
      laneId: string,
      startTime: Time,
      endTime: Time,
    ): AutomationPoint[] => {
      const lane = this.state.lanes[laneId];
      if (!lane) return [];

      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();

      return lane.points.filter((point) => {
        const pointTime = Tone.Time(point.time).toSeconds();
        return pointTime >= start && pointTime <= end;
      });
    },

    snapToGrid: (time: Time): Time => {
      // This should use the timeline grid settings
      return time;
    },

    snapToValue: (value: number, laneId: string): number => {
      const lane = this.state.lanes[laneId];
      if (!lane?.valueSteps) return value;

      return lane.valueSteps.reduce((prev, curr) => {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      });
    },
  };

  private clampValue(value: number, lane: AutomationLane): number {
    return Math.max(lane.minValue, Math.min(lane.maxValue, value));
  }

  private interpolateValue(
    prevPoint: AutomationPoint,
    nextPoint: AutomationPoint,
    time: number,
  ): number {
    const prevTime = Tone.Time(prevPoint.time).toSeconds();
    const nextTime = Tone.Time(nextPoint.time).toSeconds();
    const timeDiff = nextTime - prevTime;
    const progress = (time - prevTime) / timeDiff;

    switch (prevPoint.curveType) {
      case AutomationCurveType.STEP:
        return prevPoint.value;

      case AutomationCurveType.EXPONENTIAL:
        return this.exponentialInterpolate(
          prevPoint.value,
          nextPoint.value,
          progress,
        );

      case AutomationCurveType.SINE:
        return this.sineInterpolate(prevPoint.value, nextPoint.value, progress);

      case AutomationCurveType.COSINE:
        return this.cosineInterpolate(
          prevPoint.value,
          nextPoint.value,
          progress,
        );

      case AutomationCurveType.HOLD:
        return progress < 1 ? prevPoint.value : nextPoint.value;

      case AutomationCurveType.LINEAR:
      default:
        return this.linearInterpolate(
          prevPoint.value,
          nextPoint.value,
          progress,
        );
    }
  }

  private linearInterpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  private exponentialInterpolate(a: number, b: number, t: number): number {
    return a + (b - a) * t * t;
  }

  private sineInterpolate(a: number, b: number, t: number): number {
    return a + ((b - a) * (Math.sin(t * Math.PI - Math.PI / 2) + 1)) / 2;
  }

  private cosineInterpolate(a: number, b: number, t: number): number {
    return a + ((b - a) * (1 - Math.cos(t * Math.PI))) / 2;
  }

  private generateColor(): string {
    // Generate a random color that's visible and distinct
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  public dispose(): void {
    this.updateState({
      lanes: {},
      selectedLaneId: null,
      selectedPoints: [],
    });
  }
}
