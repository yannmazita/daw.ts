// src/features/arrangement/services/ArrangementCoordinator.ts

import * as Tone from "tone";
import {
  ArrangementCoordinator,
  ArrangementState,
  ArrangementCoordinatorActions,
  TimelineItem,
} from "@/core/interfaces/arrangement/coordinator";
import { BaseManager } from "@/common/services/BaseManager";
import { timelineManager } from "./timelineManagerInstance";
import { patternManager } from "./patternArrangementInstance";
import { automationManager } from "./automationManagerInstance";
import { markerManager } from "./markerManagerInstance";
import { transportManager } from "@/common/services/transportManagerInstance";
import { Time } from "tone/build/esm/core/type/Units";
import { PlaybackMode } from "@/core/types/common";
import { MarkerType } from "@/core/interfaces/arrangement/markers";

export class IArrangementCoordinator
  extends BaseManager<ArrangementState>
  implements ArrangementCoordinator
{
  private clipboardData: TimelineItem[] | null = null;

  constructor() {
    super({
      viewportStartTime: 0,
      viewportEndTime: "16m",
      viewportVerticalOffset: 0,
      zoom: 1,
      tracks: [],
      patterns: [],
      markers: [],
      regions: [],
      automationLanes: {},
      selectedItems: [],
    });

    // Initialize state from managers
    this.syncState();

    // Setup transport mode handler
    transportManager.registerModeHandler(
      PlaybackMode.ARRANGEMENT,
      () => this.startPlayback(),
      () => this.stopPlayback(),
    );
  }

  public readonly actions: ArrangementCoordinatorActions = {
    // Timeline Operations
    setViewport: (
      startTime: Time,
      endTime: Time,
      verticalOffset?: number,
    ): void => {
      timelineManager.actions.setViewport({
        startTime,
        endTime,
        verticalScrollOffset:
          verticalOffset ?? this.state.viewportVerticalOffset,
      });
      this.syncState();
    },

    setZoom: (zoom: number): void => {
      timelineManager.actions.setViewport({ zoom });
      this.syncState();
    },

    scrollToTime: (time: Time): void => {
      timelineManager.actions.scrollToTime(time);
      this.syncState();
    },

    fitToContent: (): void => {
      const patterns = Object.values(this.state.patterns);
      if (patterns.length === 0) return;

      const startTimes = patterns.map((p) =>
        Tone.Time(p.startTime).toSeconds(),
      );
      const endTimes = patterns.map(
        (p) =>
          Tone.Time(p.startTime).toSeconds() +
          Tone.Time(p.duration).toSeconds(),
      );

      const start = Math.min(...startTimes);
      const end = Math.max(...endTimes);

      timelineManager.actions.zoomToFit(
        Tone.Time(start).toBarsBeatsSixteenths(),
        Tone.Time(end).toBarsBeatsSixteenths(),
      );
      this.syncState();
    },

    // Track Operations
    createTrack: (name: string): string => {
      const trackId = timelineManager.actions.createTrack(name);
      this.syncState();
      return trackId;
    },

    deleteTrack: (trackId: string): void => {
      // Remove all patterns on this track
      const trackPatterns = patternManager.actions.getTrackPatterns(trackId);
      trackPatterns.forEach((pattern) => {
        patternManager.actions.removePattern(pattern.id);
      });

      // Remove all automation lanes for this track
      Object.values(automationManager.state.lanes)
        .filter((lane) => lane.trackId === trackId)
        .forEach((lane) => {
          automationManager.actions.deleteLane(lane.id);
        });

      // Remove the track
      timelineManager.actions.deleteTrack(trackId);
      this.syncState();
    },

    reorderTracks: (trackIds: string[]): void => {
      timelineManager.actions.reorderTracks(trackIds);
      this.syncState();
    },

    // Pattern Operations
    addPattern: (
      trackId: string,
      patternId: string,
      startTime: Time,
    ): string => {
      const id = patternManager.actions.addPattern(
        trackId,
        patternId,
        startTime,
      );
      this.syncState();
      return id;
    },

    moveItems: (items: TimelineItem[], deltaTime: Time): void => {
      const deltaSeconds = Tone.Time(deltaTime).toSeconds();

      items.forEach((item) => {
        switch (item.type) {
          case "pattern": {
            const pattern = patternManager.actions.getPattern(item.id);
            if (pattern) {
              const newTime = Tone.Time(
                Tone.Time(pattern.startTime).toSeconds() + deltaSeconds,
              ).toBarsBeatsSixteenths();
              patternManager.actions.movePattern(item.id, newTime);
            }
            break;
          }
          case "marker": {
            const marker = markerManager.state.markers.find(
              (m) => m.id === item.id,
            );
            if (marker) {
              const newTime = Tone.Time(
                Tone.Time(marker.time).toSeconds() + deltaSeconds,
              ).toBarsBeatsSixteenths();
              markerManager.actions.moveMarker(item.id, newTime);
            }
            break;
          }
          case "region": {
            const region = markerManager.state.regions.find(
              (r) => r.id === item.id,
            );
            if (region) {
              const newTime = Tone.Time(
                Tone.Time(region.startTime).toSeconds() + deltaSeconds,
              ).toBarsBeatsSixteenths();
              markerManager.actions.moveRegion(item.id, newTime);
            }
            break;
          }
          case "automationPoint": {
            const lane = automationManager.state.lanes[item.laneId];
            const point = lane?.points.find((p) => p.id === item.pointId);
            if (lane && point) {
              const newTime = Tone.Time(
                Tone.Time(point.time).toSeconds() + deltaSeconds,
              ).toBarsBeatsSixteenths();
              automationManager.actions.movePoint(
                item.laneId,
                item.pointId,
                newTime,
                point.value,
              );
            }
            break;
          }
        }
      });

      this.syncState();
    },

    deleteItems: (items: TimelineItem[]): void => {
      items.forEach((item) => {
        switch (item.type) {
          case "pattern":
            patternManager.actions.removePattern(item.id);
            break;
          case "marker":
            markerManager.actions.removeMarker(item.id);
            break;
          case "region":
            markerManager.actions.removeRegion(item.id);
            break;
          case "automationPoint":
            automationManager.actions.removePoint(item.laneId, item.pointId);
            break;
        }
      });

      this.syncState();
    },

    duplicateItems: (items: TimelineItem[]): TimelineItem[] => {
      const newItems: TimelineItem[] = [];

      items.forEach((item) => {
        switch (item.type) {
          case "pattern": {
            const pattern = patternManager.actions.getPattern(item.id);
            if (pattern) {
              const newId = patternManager.actions.duplicatePattern(item.id);
              newItems.push({ type: "pattern", id: newId });
            }
            break;
          }
          case "marker": {
            const marker = markerManager.state.markers.find(
              (m) => m.id === item.id,
            );
            if (marker) {
              const newId = markerManager.actions.addMarker(
                marker.time,
                marker.type,
                marker.value,
                marker.color,
              );
              newItems.push({ type: "marker", id: newId });
            }
            break;
          }
          case "region": {
            const region = markerManager.state.regions.find(
              (r) => r.id === item.id,
            );
            if (region) {
              const newId = markerManager.actions.addRegion(
                region.startTime,
                region.duration,
                region.name,
                region.color,
                region.isLoop,
              );
              newItems.push({ type: "region", id: newId });
            }
            break;
          }
          case "automationPoint": {
            const lane = automationManager.state.lanes[item.laneId];
            const point = lane?.points.find((p) => p.id === item.pointId);
            if (lane && point) {
              const newId = automationManager.actions.addPoint(
                item.laneId,
                point.time,
                point.value,
                point.curveType,
              );
              newItems.push({
                type: "automationPoint",
                laneId: item.laneId,
                pointId: newId,
              });
            }
            break;
          }
        }
      });

      this.syncState();
      return newItems;
    },

    splitPatternAtTime: (patternId: string, time: Time): [string, string] => {
      const result = patternManager.actions.splitPattern(patternId, time);
      this.syncState();
      return result;
    },

    // Automation Operations
    createAutomationLane: (trackId: string, parameterName: string): string => {
      const id = automationManager.actions.createLane(
        trackId,
        parameterName,
        `${trackId}_${parameterName}`,
        {},
      );
      this.syncState();
      return id;
    },

    addAutomationPoint: (laneId: string, time: Time, value: number): string => {
      const id = automationManager.actions.addPoint(laneId, time, value);
      this.syncState();
      return id;
    },

    // Marker/Region Operations
    addMarker: (time: Time, name: string): string => {
      const id = markerManager.actions.addMarker(time, MarkerType.GENERIC, {
        type: MarkerType.GENERIC,
        label: name,
      });
      this.syncState();
      return id;
    },

    addRegion: (startTime: Time, duration: Time, name: string): string => {
      const id = markerManager.actions.addRegion(
        startTime,
        duration,
        name,
        this.generateColor(),
      );
      this.syncState();
      return id;
    },

    setLoopRegion: (regionId: string | null): void => {
      markerManager.actions.setLoopRegion(regionId);
      this.syncState();
    },

    // Selection
    selectItems: (items: TimelineItem[]): void => {
      // Clear existing selections
      patternManager.actions.clearSelection();
      automationManager.actions.clearSelection();

      // Group items by type and update selections
      const patterns: string[] = [];
      const points: string[] = [];

      items.forEach((item) => {
        switch (item.type) {
          case "pattern":
            patterns.push(item.id);
            break;
          case "automationPoint":
            points.push(item.pointId);
            break;
        }
      });

      if (patterns.length) patternManager.actions.selectPatterns(patterns);
      if (points.length) automationManager.actions.selectPoints(points);

      this.updateState({ selectedItems: items });
    },

    clearSelection: (): void => {
      patternManager.actions.clearSelection();
      automationManager.actions.clearSelection();
      this.updateState({ selectedItems: [] });
    },

    // Clipboard Operations
    copyItems: (items: TimelineItem[]): void => {
      this.clipboardData = items;
    },

    cutItems: (items: TimelineItem[]): void => {
      this.clipboardData = items;
      this.actions.deleteItems(items);
    },

    paste: (time: Time, trackId?: string): TimelineItem[] => {
      if (!this.clipboardData) return [];

      const pasteTimeSeconds = Tone.Time(time).toSeconds();
      const newItems: TimelineItem[] = [];

      // Find the earliest time in clipboard items to calculate offset
      let earliestTime = Infinity;
      this.clipboardData.forEach((item) => {
        switch (item.type) {
          case "pattern": {
            const pattern = patternManager.actions.getPattern(item.id);
            if (pattern) {
              earliestTime = Math.min(
                earliestTime,
                Tone.Time(pattern.startTime).toSeconds(),
              );
            }
            break;
          }
          case "marker": {
            const marker = markerManager.state.markers.find(
              (m) => m.id === item.id,
            );
            if (marker) {
              earliestTime = Math.min(
                earliestTime,
                Tone.Time(marker.time).toSeconds(),
              );
            }
            break;
          }
          case "region": {
            const region = markerManager.state.regions.find(
              (r) => r.id === item.id,
            );
            if (region) {
              earliestTime = Math.min(
                earliestTime,
                Tone.Time(region.startTime).toSeconds(),
              );
            }
            break;
          }
          case "automationPoint": {
            const lane = automationManager.state.lanes[item.laneId];
            const point = lane?.points.find((p) => p.id === item.pointId);
            if (point) {
              earliestTime = Math.min(
                earliestTime,
                Tone.Time(point.time).toSeconds(),
              );
            }
            break;
          }
        }
      });

      // Calculate the time offset
      const timeOffset = pasteTimeSeconds - earliestTime;

      // Paste items with offset
      this.clipboardData.forEach((item) => {
        switch (item.type) {
          case "pattern": {
            const pattern = patternManager.actions.getPattern(item.id);
            if (pattern) {
              const targetTrackId = trackId ?? pattern.trackId;
              const newStartTime = Tone.Time(
                Tone.Time(pattern.startTime).toSeconds() + timeOffset,
              ).toBarsBeatsSixteenths();

              const newId = patternManager.actions.addPattern(
                targetTrackId,
                pattern.patternId,
                newStartTime,
                {
                  ...pattern,
                  id: undefined, // Will be generated
                  trackId: undefined, // Will be set
                  startTime: undefined, // Will be set
                },
              );
              newItems.push({ type: "pattern", id: newId });
            }
            break;
          }
          case "marker": {
            const marker = markerManager.state.markers.find(
              (m) => m.id === item.id,
            );
            if (marker) {
              const newTime = Tone.Time(
                Tone.Time(marker.time).toSeconds() + timeOffset,
              ).toBarsBeatsSixteenths();

              const newId = markerManager.actions.addMarker(
                newTime,
                marker.type,
                marker.value,
                marker.color,
              );
              newItems.push({ type: "marker", id: newId });
            }
            break;
          }
          case "region": {
            const region = markerManager.state.regions.find(
              (r) => r.id === item.id,
            );
            if (region) {
              const newStartTime = Tone.Time(
                Tone.Time(region.startTime).toSeconds() + timeOffset,
              ).toBarsBeatsSixteenths();

              const newId = markerManager.actions.addRegion(
                newStartTime,
                region.duration,
                region.name,
                region.color,
                region.isLoop,
              );
              newItems.push({ type: "region", id: newId });
            }
            break;
          }
          case "automationPoint": {
            const lane = automationManager.state.lanes[item.laneId];
            const point = lane?.points.find((p) => p.id === item.pointId);
            if (lane && point) {
              const newTime = Tone.Time(
                Tone.Time(point.time).toSeconds() + timeOffset,
              ).toBarsBeatsSixteenths();

              const newId = automationManager.actions.addPoint(
                item.laneId,
                newTime,
                point.value,
                point.curveType,
              );
              newItems.push({
                type: "automationPoint",
                laneId: item.laneId,
                pointId: newId,
              });
            }
            break;
          }
        }
      });

      this.syncState();
      return newItems;
    },

    // Playback
    startPlayback: async (time?: Time): Promise<void> => {
      await transportManager.actions.setMode(PlaybackMode.ARRANGEMENT);
      await transportManager.actions.play(time);
    },

    stopPlayback: (): void => {
      transportManager.actions.stop();
    },
  };

  private syncState(): void {
    this.updateState({
      viewportStartTime: timelineManager.state.viewport.startTime,
      viewportEndTime: timelineManager.state.viewport.endTime,
      viewportVerticalOffset:
        timelineManager.state.viewport.verticalScrollOffset,
      zoom: timelineManager.state.viewport.zoom,
      tracks: timelineManager.state.tracks,
      patterns: Object.values(patternManager.state.patterns),
      markers: markerManager.state.markers,
      regions: markerManager.state.regions,
      automationLanes: automationManager.state.lanes,
    });
  }

  private startPlayback(): void {
    // Handle arrangement-specific playback setup
    const activeLoop = markerManager.actions.getActiveLoopRegion();
    if (activeLoop) {
      transportManager.actions.setLoop(
        true,
        activeLoop.startTime,
        Tone.Time(activeLoop.startTime).toSeconds() +
          Tone.Time(activeLoop.duration).toSeconds(),
      );
    }
  }

  private stopPlayback(): void {
    // Handle arrangement-specific playback cleanup
    transportManager.actions.setLoop(false);
  }

  private generateColor(): string {
    const hue = Math.random() * 360;
    return `hsl(${hue}, 70%, 50%)`;
  }

  public dispose(): void {
    timelineManager.dispose();
    patternManager.dispose();
    automationManager.dispose();
    markerManager.dispose();
    this.clipboardData = null;
    this.updateState({
      viewportStartTime: 0,
      viewportEndTime: "16m",
      viewportVerticalOffset: 0,
      zoom: 1,
      tracks: [],
      patterns: [],
      markers: [],
      regions: [],
      automationLanes: {},
      selectedItems: [],
    });
  }
}
