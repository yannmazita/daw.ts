// src/features/arrangement/services/ArrangementEngine.ts
import { v4 as uuidv4 } from "uuid";
import { Time } from "tone/build/esm/core/type/Units";
import { ArrangementEngine, ArrangementState, Track } from "../types";
import { TransportEngine } from "../../transport/types";
import { ClipEngine } from "../../clips/types";
import { MixEngine } from "../../mix/types";
import { AutomationEngine } from "../../automation/types";
import { initialArrangementState } from "../utils/initialState";
import { useEngineStore } from "@/core/stores/useEngineStore";

export class ArrangementEngineImpl implements ArrangementEngine {
  constructor(
    public readonly transportEngine: TransportEngine,
    public readonly clipEngine: ClipEngine,
    public readonly mixEngine: MixEngine,
    public readonly automationEngine: AutomationEngine,
  ) {
    // Initialize master track
    const masterTrackId = this.createTrack("master", "Master");
    useEngineStore.getState().updateArrangement({ masterTrackId });
  }

  createTrack(type: Track["type"], name: string): string {
    const state = useEngineStore.getState().arrangement;
    const id = uuidv4();
    const index = state.trackOrder.length;

    // Create mixer channel first
    const mixerChannelId = this.mixEngine.createChannel(type);

    const track: Track = {
      id,
      type,
      name,
      index,
      height: 100, // Default height
      isVisible: true,
      isFolded: false,
      mixerChannelId,
      clipIds: [],
      automationIds: [],
      color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
    };

    // Update state
    useEngineStore.getState().updateArrangement({
      tracks: {
        ...state.tracks,
        [id]: track,
      },
      trackOrder: [...state.trackOrder, id],
    });

    // Handle special track types
    if (type === "return") {
      useEngineStore.getState().updateArrangement({
        returnTracks: [...state.returnTracks, id],
      });
    }

    return id;
  }

  deleteTrack(trackId: string): void {
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];
    if (!track) return;

    // Prevent master track deletion
    if (trackId === state.masterTrackId) {
      throw new Error("Cannot delete master track");
    }

    // Clean up clips
    track.clipIds.forEach((clipId) => {
      this.clipEngine.unscheduleClip(clipId);
    });

    // Clean up automation
    track.automationIds.forEach((automationId) => {
      this.automationEngine.unscheduleLane(automationId);
    });

    // Clean up mixer channel
    this.mixEngine.deleteChannel(track.mixerChannelId);

    // Update state
    useEngineStore.getState().updateArrangement({
      tracks: Object.fromEntries(
        Object.entries(state.tracks).filter(([id]) => id !== trackId),
      ),
      trackOrder: state.trackOrder.filter((id) => id !== trackId),
    });
    if (track.type === "return") {
      useEngineStore.getState().updateArrangement({
        returnTracks: state.returnTracks.filter((id) => id !== trackId),
      });
    }

    // Clear selection if needed
    if (state.selection.trackIds.includes(trackId)) {
      useEngineStore.getState().updateArrangement({
        selection: {
          ...state.selection,
          trackIds: state.selection.trackIds.filter((id) => id !== trackId),
        },
      });
    }

    // Reindex remaining tracks
    useEngineStore.getState().updateArrangement({
      tracks: Object.fromEntries(
        Object.entries(state.tracks).map(([id, track]) => {
          if (track.index > track.index) {
            return [id, { ...track, index: track.index - 1 }];
          }
          return [id, track];
        }),
      ),
    });
  }

  moveTrack(trackId: string, newIndex: number): void {
    const state = useEngineStore.getState().arrangement;
    const track = state.tracks[trackId];
    if (!track) return;

    // Validate new index
    if (newIndex < 0 || newIndex >= state.trackOrder.length) {
      throw new Error("Invalid track index");
    }

    // Remove from current position
    useEngineStore.getState().updateArrangement({
      trackOrder: state.trackOrder.filter((id) => id !== trackId),
    });

    // Insert at new position
    useEngineStore.getState().updateArrangement({
      trackOrder: [
        ...state.trackOrder.slice(0, newIndex),
        trackId,
        ...state.trackOrder.slice(newIndex),
      ],
    });

    // Update indices
    useEngineStore.getState().updateArrangement({
      tracks: {
        ...state.tracks,
        [trackId]: {
          ...track,
          index: newIndex,
        },
      },
    });
  }

  setSelection(selection: Partial<ArrangementState["selection"]>): void {
    const state = useEngineStore.getState().arrangement;
    useEngineStore.getState().updateArrangement({
      selection: {
        ...state.selection,
        ...selection,
      },
    });
  }

  setViewRange(startTime: Time, endTime: Time): void {
    const state = useEngineStore.getState().arrangement;
    useEngineStore.getState().updateArrangement({
      viewState: {
        ...state.viewState,
        startTime,
        endTime,
      },
    });
  }

  setZoom(zoom: number): void {
    const state = useEngineStore.getState().arrangement;
    useEngineStore.getState().updateArrangement({
      viewState: {
        ...state.viewState,
        zoom: Math.max(0.1, Math.min(10, zoom)),
      },
    });
  }

  getState(): ArrangementState {
    return useEngineStore.getState().arrangement;
  }

  dispose(): void {
    const state = useEngineStore.getState().arrangement;
    // Clean up all tracks
    Object.keys(state.tracks).forEach((trackId) => {
      if (trackId !== state.masterTrackId) {
        this.deleteTrack(trackId);
      }
    });

    // Reset state
    useEngineStore.getState().updateArrangement({ ...initialArrangementState });
  }
}
