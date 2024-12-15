// src/features/arrangement/services/TimelineManager.ts
import * as Tone from "tone";
import {
  TimelineManager,
  TimelineManagerState,
  TimelineManagerActions,
  TimelineTrack,
  TimelineViewport,
  TimelineGridSettings,
  TimelineSnapUnit,
  SelectedTimelineItems,
} from "@/core/interfaces/arrangement/timeline";
import { BaseManager } from "@/common/services/BaseManager";
import { Time } from "tone/build/esm/core/type/Units";

export class ArrangementTimelineManager
  extends BaseManager<TimelineManagerState>
  implements TimelineManager
{
  private readonly MIN_TRACK_HEIGHT = 40;
  private readonly MAX_TRACK_HEIGHT = 200;
  private readonly DEFAULT_TRACK_HEIGHT = 100;
  private readonly MIN_ZOOM = 0.1;
  private readonly MAX_ZOOM = 10;
  private readonly PIXELS_PER_SECOND = 100; // At zoom level 1

  constructor() {
    super({
      tracks: [],
      viewport: {
        startTime: 0,
        endTime: "16m",
        verticalScrollOffset: 0,
        zoom: 1,
      },
      grid: {
        snapEnabled: true,
        snapUnit: TimelineSnapUnit.BAR,
        subdivisions: 4,
        showGrid: true,
      },
      selection: null,
    });
  }

  public readonly actions: TimelineManagerActions = {
    // Track Management
    createTrack: (name: string, parentId?: string): string => {
      const track: TimelineTrack = {
        id: `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        index: this.state.tracks.length,
        height: this.DEFAULT_TRACK_HEIGHT,
        isVisible: true,
        isFolded: false,
        parentId,
        childIds: [],
      };

      if (parentId) {
        const parent = this.state.tracks.find((t) => t.id === parentId);
        if (!parent) {
          throw new Error("Parent track not found");
        }
        parent.childIds.push(track.id);
      }

      this.updateState({
        tracks: [...this.state.tracks, track],
      });

      return track.id;
    },

    deleteTrack: (trackId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track) return;

      // Remove from parent if exists
      if (track.parentId) {
        const parent = this.state.tracks.find((t) => t.id === track.parentId);
        if (parent) {
          parent.childIds = parent.childIds.filter((id) => id !== trackId);
        }
      }

      // Delete child tracks recursively
      const allTracksToDelete = this.getAllChildTracks(trackId);
      allTracksToDelete.push(trackId);

      this.updateState({
        tracks: this.state.tracks
          .filter((t) => !allTracksToDelete.includes(t.id))
          .map((t, index) => ({ ...t, index })),
      });
    },

    reorderTracks: (trackIds: string[]): void => {
      if (!this.actions.validateTrackOrder(trackIds)) {
        throw new Error("Invalid track order");
      }

      const reorderedTracks = trackIds
        .map((id) => this.state.tracks.find((t) => t.id === id))
        .filter((track): track is TimelineTrack => track !== undefined)
        .map((track, index) => ({ ...track, index }));

      this.updateState({ tracks: reorderedTracks });
    },

    setTrackVisibility: (trackId: string, isVisible: boolean): void => {
      this.updateTrack(trackId, { isVisible });
    },

    setTrackHeight: (trackId: string, height: number): void => {
      const clampedHeight = Math.max(
        this.MIN_TRACK_HEIGHT,
        Math.min(this.MAX_TRACK_HEIGHT, height),
      );
      this.updateTrack(trackId, { height: clampedHeight });
    },

    foldTrack: (trackId: string, isFolded: boolean): void => {
      this.updateTrack(trackId, { isFolded });
    },

    // Track Groups
    createTrackGroup: (name: string, trackIds: string[]): string => {
      const groupId = this.actions.createTrack(name);
      trackIds.forEach((trackId) => this.actions.addToGroup(groupId, trackId));
      return groupId;
    },

    addToGroup: (groupId: string, trackId: string): void => {
      const group = this.state.tracks.find((t) => t.id === groupId);
      const track = this.state.tracks.find((t) => t.id === trackId);

      if (!group || !track) {
        throw new Error("Group or track not found");
      }

      if (track.parentId) {
        this.actions.removeFromGroup(trackId);
      }

      this.updateTrack(trackId, { parentId: groupId });
      this.updateTrack(groupId, {
        childIds: [...group.childIds, trackId],
      });
    },

    removeFromGroup: (trackId: string): void => {
      const track = this.state.tracks.find((t) => t.id === trackId);
      if (!track?.parentId) return;

      const parent = this.state.tracks.find((t) => t.id === track.parentId);
      if (parent) {
        this.updateTrack(parent.id, {
          childIds: parent.childIds.filter((id) => id !== trackId),
        });
      }

      this.updateTrack(trackId, { parentId: undefined });
    },

    // Viewport Control
    setViewport: (viewport: Partial<TimelineViewport>): void => {
      this.updateState({
        viewport: {
          ...this.state.viewport,
          ...viewport,
          zoom: viewport.zoom
            ? Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, viewport.zoom))
            : this.state.viewport.zoom,
        },
      });
    },

    zoomToFit: (startTime: Time, endTime: Time): void => {
      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();
      const duration = end - start;
      const viewportWidth = window.innerWidth;
      const zoom = viewportWidth / (duration * this.PIXELS_PER_SECOND);

      this.actions.setViewport({
        startTime,
        endTime,
        zoom: Math.max(this.MIN_ZOOM, Math.min(this.MAX_ZOOM, zoom)),
      });
    },

    zoomToSelection: (): void => {
      if (!this.state.selection?.itemIds.length) return;
      // Implementation depends on how timeline items store their time ranges
    },

    scrollToTime: (time: Time): void => {
      const timeInSeconds = Tone.Time(time).toSeconds();
      const viewportDuration =
        Tone.Time(this.state.viewport.endTime).toSeconds() -
        Tone.Time(this.state.viewport.startTime).toSeconds();

      this.actions.setViewport({
        startTime: time,
        endTime: Tone.Time(
          timeInSeconds + viewportDuration,
        ).toBarsBeatsSixteenths(),
      });
    },

    // Grid Control
    setGridSettings: (settings: Partial<TimelineGridSettings>): void => {
      this.updateState({
        grid: {
          ...this.state.grid,
          ...settings,
        },
      });
    },

    snapTimeToGrid: (time: Time): Time => {
      if (!this.state.grid.snapEnabled) return time;

      const timeInSeconds = Tone.Time(time).toSeconds();
      const snapInterval = this.getSnapInterval();
      const snappedSeconds =
        Math.round(timeInSeconds / snapInterval) * snapInterval;

      return Tone.Time(snappedSeconds).toBarsBeatsSixteenths();
    },

    getGridLines: (startTime: Time, endTime: Time): Time[] => {
      if (!this.state.grid.showGrid) return [];

      const start = Tone.Time(startTime).toSeconds();
      const end = Tone.Time(endTime).toSeconds();
      const interval = this.getSnapInterval();
      const lines: Time[] = [];

      for (let time = start; time <= end; time += interval) {
        lines.push(Tone.Time(time).toBarsBeatsSixteenths());
      }

      return lines;
    },

    // Selection
    setSelection: (selection: SelectedTimelineItems | null): void => {
      this.updateState({ selection });
    },

    clearSelection: (): void => {
      this.updateState({ selection: null });
    },

    isSelected: (itemId: string): boolean => {
      return !!this.state.selection?.itemIds.includes(itemId);
    },

    // Utilities
    getTrackAt: (yPosition: number): TimelineTrack | null => {
      let currentOffset = 0;
      const visibleTracks = this.actions.getVisibleTracks();

      for (const track of visibleTracks) {
        if (
          yPosition >= currentOffset &&
          yPosition < currentOffset + track.height
        ) {
          return track;
        }
        currentOffset += track.height;
      }

      return null;
    },

    getTimeAtX: (x: number): Time => {
      const pixelsPerSecond = this.PIXELS_PER_SECOND * this.state.viewport.zoom;
      const seconds = x / pixelsPerSecond;
      return Tone.Time(seconds).toBarsBeatsSixteenths();
    },

    getXAtTime: (time: Time): number => {
      const seconds = Tone.Time(time).toSeconds();
      return seconds * this.PIXELS_PER_SECOND * this.state.viewport.zoom;
    },

    getVisibleTracks: (): TimelineTrack[] => {
      return this.state.tracks.filter((track) => track.isVisible);
    },

    getTrackById: (trackId: string): TimelineTrack | undefined => {
      return this.state.tracks.find((track) => track.id === trackId);
    },

    validateTrackOrder: (trackIds: string[]): boolean => {
      // Check if all IDs exist and are unique
      const uniqueIds = new Set(trackIds);
      if (uniqueIds.size !== trackIds.length) return false;

      // Check if all tracks exist
      return trackIds.every((id) => this.state.tracks.some((t) => t.id === id));
    },
  };

  private updateTrack(trackId: string, updates: Partial<TimelineTrack>): void {
    this.updateState({
      tracks: this.state.tracks.map((track) =>
        track.id === trackId ? { ...track, ...updates } : track,
      ),
    });
  }

  private getAllChildTracks(trackId: string): string[] {
    const track = this.state.tracks.find((t) => t.id === trackId);
    if (!track) return [];

    const childIds: string[] = [];
    const queue = [...track.childIds];

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      childIds.push(currentId);

      const currentTrack = this.state.tracks.find((t) => t.id === currentId);
      if (currentTrack?.childIds.length) {
        queue.push(...currentTrack.childIds);
      }
    }

    return childIds;
  }

  private getSnapInterval(): number {
    const { snapUnit, subdivisions } = this.state.grid;
    let interval: Time;

    switch (snapUnit) {
      case TimelineSnapUnit.BAR:
        interval = "1m";
        break;
      case TimelineSnapUnit.BEAT:
        interval = "4n";
        break;
      case TimelineSnapUnit.SIXTEENTH:
        interval = "16n";
        break;
      case TimelineSnapUnit.THIRTY_SECOND:
        interval = "32n";
        break;
      case TimelineSnapUnit.TICKS:
        interval = "1i";
        break;
      default:
        return 0;
    }

    return Tone.Time(interval).toSeconds() / subdivisions;
  }

  public dispose(): void {
    this.updateState({
      tracks: [],
      viewport: {
        startTime: 0,
        endTime: "16m",
        verticalScrollOffset: 0,
        zoom: 1,
      },
      grid: {
        snapEnabled: true,
        snapUnit: TimelineSnapUnit.BAR,
        subdivisions: 4,
        showGrid: true,
      },
      selection: null,
    });
  }
}
