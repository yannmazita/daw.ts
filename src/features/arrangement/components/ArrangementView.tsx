// src/features/arrangement/components/ArrangementView.tsx
import { useRef, useState } from "react";
import { UnifiedTimelineGrid } from "./UnifiedTimelineGrid";
import { TrackList } from "./TrackList";
import { Playhead } from "./Playhead";
import { GRID_CONSTANTS } from "../utils/constants";
import { useStore } from "@/common/slices/useStore";
import * as Tone from "tone";

export const ArrangementView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { position } = useStore();
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(GRID_CONSTANTS.DEFAULT_ZOOM);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop,
    });

    // If we have a track list container, sync its scroll position
    const trackListContainer = document.querySelector(".track-list-container")!;
    if (trackListContainer) {
      trackListContainer.scrollTop = target.scrollTop;
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(
        Math.max(zoom + delta * zoom, GRID_CONSTANTS.MIN_ZOOM),
        GRID_CONSTANTS.MAX_ZOOM,
      );
      setZoom(newZoom);
    }
  };

  return (
    <div className="relative flex">
      {/* Fixed Left Panel */}
      <div
        className="flex flex-shrink-0 flex-col border-r border-border bg-background"
        style={{ width: GRID_CONSTANTS.HEADER_WIDTH }}
      >
        {/* Header space to align with time ruler */}
        <div
          className="border-b border-border"
          style={{ height: GRID_CONSTANTS.RULER_HEIGHT }}
        />
        {/* Track headers */}
        <div className="track-list-container flex-1 overflow-y-hidden">
          <TrackList />
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={containerRef}
          className="h-full overflow-auto"
          onScroll={handleScroll}
          onWheel={handleWheel}
        >
          <div
            className="relative"
            style={{
              // Set minimum width based on 32 bars
              minWidth: 32 * 4 * zoom,
              // Set height based on number of tracks (8 for testing)
              height:
                8 * GRID_CONSTANTS.TRACK_HEIGHT + GRID_CONSTANTS.RULER_HEIGHT,
            }}
          >
            <UnifiedTimelineGrid zoom={zoom} scrollPosition={scrollPosition} />
            <Playhead
              position={Tone.Time(position).toSeconds()}
              zoom={zoom}
              scrollX={scrollPosition.x}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
