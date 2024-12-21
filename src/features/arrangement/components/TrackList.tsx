// src/features/arrangement/components/TrackList.tsx
import { useCallback } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { TrackHeader } from "./TrackHeader";
import { useDrop } from "react-dnd";
import { DragTypes } from "../types";

interface TrackDragItem {
  type: typeof DragTypes.TRACK;
  id: string;
  index: number;
}

interface DropCollectedProps {
  isOver: boolean;
}

const useTrackListState = () => {
  return useEngineStore((state) => ({
    trackOrder: state.arrangement.trackOrder,
    tracks: state.arrangement.tracks,
    viewSettings: state.arrangement.viewSettings,
  }));
};

export const TrackList: React.FC = () => {
  const { trackOrder, tracks, viewSettings } = useTrackListState();
  const arrangementEngine = useArrangementEngine();

  // Handle dropping tracks for reordering
  const [{ isOver }, drop] = useDrop<TrackDragItem, void, DropCollectedProps>(
    () => ({
      accept: DragTypes.TRACK,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      hover(item: TrackDragItem, monitor) {
        if (!monitor.isOver({ shallow: true })) return;

        // If hovering over the list container, move to last position
        const lastIndex = trackOrder.length - 1;
        if (item.index !== lastIndex) {
          arrangementEngine.moveTrack(item.id, lastIndex);
          item.index = lastIndex;
        }
      },
    }),
    [trackOrder],
  );

  const calculateTotalHeight = useCallback(() => {
    return trackOrder.reduce((total, trackId) => {
      const track = tracks[trackId];
      if (!track) return total;
      return (
        total +
        (track.isFolded
          ? viewSettings.foldedHeight
          : viewSettings.trackHeights[trackId] || viewSettings.defaultHeight)
      );
    }, 0);
  }, [trackOrder, tracks, viewSettings]);

  return (
    <div
      ref={drop}
      className={`flex flex-col ${isOver ? "bg-accent/20" : ""}`}
      style={{ height: calculateTotalHeight() }}
    >
      {trackOrder.map((trackId) => (
        <TrackHeader key={trackId} trackId={trackId} />
      ))}
    </div>
  );
};
