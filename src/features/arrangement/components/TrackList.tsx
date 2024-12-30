import { useMemo } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTrackOperations } from "../hooks/useTrackOperations";
import { useLayoutStore } from "@/core/stores/useLayoutStore";
import { TrackHeader } from "./TrackHeader/TrackHeader";
import { useDrop } from "react-dnd";
import { DragTypes } from "../types";
import { GRID_CONSTANTS } from "../utils/constants";

interface TrackDragItem {
  type: typeof DragTypes.TRACK;
  id: string;
  index: number;
}

interface DropCollectedProps {
  isOver: boolean;
}

export const TrackList: React.FC = () => {
  const { trackOrder, moveTrack } = useTrackOperations();

  // Get raw state from stores
  const mixerTracks = useEngineStore((state) => state.mix.mixerTracks);
  const layoutState = useLayoutStore((state) => state);

  // Memoize the results of Object.entries and object creation
  const mixerTrackEntries = useMemo(
    () => Object.entries(mixerTracks),
    [mixerTracks],
  );
  const layoutSettings = useMemo(
    () => ({
      defaultTrackHeight: layoutState.defaultTrackHeight,
      foldedTrackHeight: layoutState.foldedTrackHeight,
      trackLayouts: layoutState.trackLayouts,
    }),
    [layoutState],
  );

  // Memoize derived data
  const { returnTracks, masterTrack } = useMemo(() => {
    const returns = mixerTrackEntries
      .filter(([_, track]) => track.type === "return")
      .sort((a, b) => a[1].name.localeCompare(b[1].name));

    const master = mixerTrackEntries.find(
      ([, track]) => track.type === "master",
    );

    return { returnTracks: returns, masterTrack: master };
  }, [mixerTrackEntries]);

  // Calculate heights for different sections (memoized)
  const calculateArrangementHeight = useMemo(() => {
    const { trackLayouts, defaultTrackHeight, foldedTrackHeight } =
      layoutSettings;

    return trackOrder.reduce((total, trackId) => {
      const layout = trackLayouts[trackId];
      if (!layout) return total + defaultTrackHeight;
      return total + (layout.isFolded ? foldedTrackHeight : layout.height);
    }, 0);
  }, [trackOrder, layoutSettings]);

  const calculateMixerHeight = useMemo(() => {
    return (returnTracks.length + 1) * layoutSettings.defaultTrackHeight;
  }, [returnTracks, layoutSettings]);

  // Handle dropping tracks for reordering
  const [{ isOver }, drop] = useDrop<TrackDragItem, never, DropCollectedProps>(
    () => ({
      accept: DragTypes.TRACK,
      collect: (monitor) => ({
        isOver: monitor.isOver(),
      }),
      hover(item: TrackDragItem, monitor) {
        if (!monitor.isOver({ shallow: true })) return;

        const dragIndex = item.index;
        const hoverIndex = trackOrder.length - 1;

        if (dragIndex === hoverIndex) return;

        moveTrack(item.id, hoverIndex);
        item.index = hoverIndex;
      },
      canDrop: (_item) => true,
    }),
    [trackOrder, moveTrack],
  );

  // Memoize the rendered lists
  const arrangementTracks = useMemo(
    () =>
      trackOrder.map((trackId) => (
        <TrackHeader key={trackId} trackId={trackId} />
      )),
    [trackOrder],
  );

  const mixerTracksList = useMemo(
    () => (
      <>
        {returnTracks.map(([trackId]) => (
          <TrackHeader key={trackId} trackId={trackId} />
        ))}
        {masterTrack && (
          <TrackHeader key={masterTrack[0]} trackId={masterTrack[0]} />
        )}
      </>
    ),
    [returnTracks, masterTrack],
  );

  return (
    <div className="flex flex-col" style={{ height: "100%" }}>
      {/* Arrangement Tracks (Scrollable) */}
      <div
        ref={drop}
        className="flex-1 overflow-y-auto"
        style={{
          minHeight: GRID_CONSTANTS.MIN_TOTAL_HEIGHT,
        }}
      >
        <div
          className={`relative flex flex-col ${isOver ? "after:absolute after:inset-0 after:bg-accent/20" : ""}`}
          style={{ height: calculateArrangementHeight }}
        >
          {arrangementTracks}
        </div>
      </div>

      {/* Mixer Tracks (Fixed at bottom) */}
      <div
        className="flex-none border-t border-border bg-background/50"
        style={{ height: calculateMixerHeight }}
      >
        {mixerTracksList}
      </div>
    </div>
  );
};
