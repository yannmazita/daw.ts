// src/features/arrangement/services/MarkerManager.ts
import * as Tone from "tone";
import {
  MarkerManager,
  MarkerManagerState,
  MarkerManagerActions,
  TimelineMarker,
  TimelineRegion,
  MarkerType,
  MarkerValue,
} from "@/core/interfaces/arrangement/markers";
import { BaseManager } from "@/common/services/BaseManager";
import { Time } from "tone/build/esm/core/type/Units";

export class TimelineMarkerManager
  extends BaseManager<MarkerManagerState>
  implements MarkerManager
{
  private readonly DEFAULT_TOLERANCE = "32n";
  private readonly MAX_REGIONS = 1000; // Prevent memory issues
  private readonly MAX_MARKERS = 1000;

  constructor() {
    super({
      markers: [],
      regions: [],
      activeLoopRegion: null,
    });
  }

  public readonly actions: MarkerManagerActions = {
    addMarker: (
      time: Time,
      type: MarkerType,
      value: MarkerValue,
      color?: string,
    ): string => {
      if (this.state.markers.length >= this.MAX_MARKERS) {
        throw new Error("Maximum number of markers reached");
      }

      // Validate time
      const timeInSeconds = Tone.Time(time).toSeconds();
      if (timeInSeconds < 0) {
        throw new Error("Marker time cannot be negative");
      }

      // Validate value based on type
      this.validateMarkerValue(type, value);

      const marker: TimelineMarker = {
        id: `marker_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name: this.generateMarkerName(type, value),
        time,
        type,
        value,
        color,
      };

      this.updateState({
        markers: [...this.state.markers, marker].sort(
          (a, b) =>
            Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
        ),
      });

      return marker.id;
    },

    removeMarker: (id: string): void => {
      this.updateState({
        markers: this.state.markers.filter((marker) => marker.id !== id),
      });
    },

    updateMarker: (
      id: string,
      updates: Partial<Omit<TimelineMarker, "id">>,
    ): void => {
      const markerIndex = this.state.markers.findIndex((m) => m.id === id);
      if (markerIndex === -1) {
        throw new Error("Marker not found");
      }

      const marker = this.state.markers[markerIndex];

      // Validate updates
      if (updates.type && updates.value) {
        this.validateMarkerValue(updates.type, updates.value);
      }

      const updatedMarker = {
        ...marker,
        ...updates,
      };

      const markers = [...this.state.markers];
      markers[markerIndex] = updatedMarker;

      // Resort if time changed
      if (updates.time) {
        markers.sort(
          (a, b) =>
            Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
        );
      }

      this.updateState({ markers });
    },

    moveMarker: (id: string, newTime: Time): void => {
      this.actions.updateMarker(id, { time: newTime });
    },

    getMarkersInRange: (startTime: Time, endTime: Time): TimelineMarker[] => {
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();

      return this.state.markers.filter((marker) => {
        const markerTime = Tone.Time(marker.time).toSeconds();
        return markerTime >= start && markerTime <= end;
      });
    },

    addRegion: (
      startTime: Time,
      duration: Time,
      name: string,
      color: string,
      isLoop = false,
    ): string => {
      if (this.state.regions.length >= this.MAX_REGIONS) {
        throw new Error("Maximum number of regions reached");
      }

      const start = Tone.Time(startTime).toSeconds();
      const length = Tone.Time(duration).toSeconds();

      if (start < 0 || length <= 0) {
        throw new Error("Invalid region boundaries");
      }

      const region: TimelineRegion = {
        id: `region_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        startTime,
        duration,
        color,
        isLoop,
        stackOrder: this.getNextStackOrder(),
      };

      if (!this.actions.validateRegionBoundaries(region)) {
        throw new Error("Region overlaps with existing loop region");
      }

      this.updateState({
        regions: [...this.state.regions, region],
      });

      // If it's a loop region and no active loop region exists, make it active
      if (isLoop && !this.state.activeLoopRegion) {
        this.actions.setLoopRegion(region.id);
      }

      return region.id;
    },

    removeRegion: (id: string): void => {
      // If removing active loop region, clear it
      if (this.state.activeLoopRegion === id) {
        this.actions.setLoopRegion(null);
      }

      this.updateState({
        regions: this.state.regions.filter((region) => region.id !== id),
      });
    },

    updateRegion: (
      id: string,
      updates: Partial<Omit<TimelineRegion, "id">>,
    ): void => {
      const regionIndex = this.state.regions.findIndex((r) => r.id === id);
      if (regionIndex === -1) {
        throw new Error("Region not found");
      }

      const region = this.state.regions[regionIndex];
      const updatedRegion = { ...region, ...updates };

      if (!this.actions.validateRegionBoundaries(updatedRegion)) {
        throw new Error("Invalid region update");
      }

      const regions = [...this.state.regions];
      regions[regionIndex] = updatedRegion;

      this.updateState({ regions });
    },

    moveRegion: (id: string, newStartTime: Time): void => {
      const region = this.state.regions.find((r) => r.id === id);
      if (!region) {
        throw new Error("Region not found");
      }

      this.actions.updateRegion(id, { startTime: newStartTime });
    },

    resizeRegion: (id: string, newDuration: Time): void => {
      const region = this.state.regions.find((r) => r.id === id);
      if (!region) {
        throw new Error("Region not found");
      }

      this.actions.updateRegion(id, { duration: newDuration });
    },

    getRegionsInRange: (startTime: Time, endTime: Time): TimelineRegion[] => {
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();

      return this.state.regions.filter((region) => {
        const regionStart = Tone.Time(region.startTime).toSeconds();
        const regionEnd = regionStart + Tone.Time(region.duration).toSeconds();
        return regionStart <= end && regionEnd >= start;
      });
    },

    setLoopRegion: (id: string | null): void => {
      if (id) {
        const region = this.state.regions.find((r) => r.id === id);
        if (!region) {
          throw new Error("Region not found");
        }
        if (!region.isLoop) {
          throw new Error("Region is not marked as a loop region");
        }
      }

      this.updateState({ activeLoopRegion: id });
    },

    getActiveLoopRegion: (): TimelineRegion | null => {
      if (!this.state.activeLoopRegion) return null;
      return (
        this.state.regions.find((r) => r.id === this.state.activeLoopRegion) ??
        null
      );
    },

    getMarkerAtTime: (time: Time, tolerance?: Time): TimelineMarker | null => {
      const targetTime = Tone.Time(time).toSeconds();
      const toleranceSeconds = Tone.Time(
        tolerance ?? this.DEFAULT_TOLERANCE,
      ).toSeconds();

      return (
        this.state.markers.find((marker) => {
          const markerTime = Tone.Time(marker.time).toSeconds();
          return Math.abs(markerTime - targetTime) <= toleranceSeconds;
        }) ?? null
      );
    },

    getRegionAtTime: (time: Time): TimelineRegion[] => {
      const targetTime = Tone.Time(time).toSeconds();

      return this.state.regions.filter((region) => {
        const start = Tone.Time(region.startTime).toSeconds();
        const end = start + Tone.Time(region.duration).toSeconds();
        return targetTime >= start && targetTime <= end;
      });
    },

    sortMarkers: (): void => {
      this.updateState({
        markers: [...this.state.markers].sort(
          (a, b) =>
            Tone.Time(a.time).toSeconds() - Tone.Time(b.time).toSeconds(),
        ),
      });
    },

    validateRegionBoundaries: (region: Partial<TimelineRegion>): boolean => {
      // If this is a loop region, ensure it doesn't overlap with other loop regions
      if (region.isLoop) {
        const start = Tone.Time(region.startTime).toSeconds();
        const end = start + Tone.Time(region.duration).toSeconds();

        return !this.state.regions.some((existing) => {
          if (!existing.isLoop || existing.id === region.id) return false;

          const existingStart = Tone.Time(existing.startTime).toSeconds();
          const existingEnd =
            existingStart + Tone.Time(existing.duration).toSeconds();

          return start < existingEnd && end > existingStart;
        });
      }

      return true;
    },
  };

  private validateMarkerValue(type: MarkerType, value: MarkerValue): void {
    if (value.type !== type) {
      throw new Error("Marker value type mismatch");
    }

    switch (type) {
      case MarkerType.TEMPO:
        if (value.type !== MarkerType.TEMPO || value.bpm <= 0) {
          throw new Error("Invalid tempo marker value");
        }
        break;
      case MarkerType.TIME_SIGNATURE:
        if (
          value.type !== MarkerType.TIME_SIGNATURE ||
          value.numerator <= 0 ||
          value.denominator <= 0
        ) {
          throw new Error("Invalid time signature marker value");
        }
        break;
    }
  }

  private generateMarkerName(type: MarkerType, value: MarkerValue): string {
    switch (type) {
      case MarkerType.TEMPO:
        return `${value.type === MarkerType.TEMPO ? value.bpm : 0} BPM`;
      case MarkerType.TIME_SIGNATURE:
        return value.type === MarkerType.TIME_SIGNATURE
          ? `${value.numerator}/${value.denominator}`
          : "Invalid Time Signature";
      case MarkerType.GENERIC:
      case MarkerType.REHEARSAL:
      case MarkerType.SECTION:
        return value.type === type ? value.label : "Marker";
      default:
        return "Marker";
    }
  }

  private getNextStackOrder(): number {
    return Math.max(0, ...this.state.regions.map((r) => r.stackOrder)) + 1;
  }

  public dispose(): void {
    this.updateState({
      markers: [],
      regions: [],
      activeLoopRegion: null,
    });
  }
}
