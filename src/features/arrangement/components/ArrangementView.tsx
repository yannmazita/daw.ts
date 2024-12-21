// src/features/arrangement/components/ArrangementView.tsx
import { useRef, useState } from "react";
import { UnifiedTimelineGrid } from "./UnifiedTimelineGrid";
import { TrackList } from "./TrackList";
import { Playhead } from "./Playhead";
import { GRID_CONSTANTS } from "../utils/constants";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { useZoomGestures } from "../hooks/useZoomGestures";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { TouchBackend } from "react-dnd-touch-backend";
import { useIsMobile } from "@/common/shadcn/hooks/use-mobile";
import * as Tone from "tone";

export const ArrangementView = () => {
  const isMobile = useIsMobile();
  const backend = isMobile ? TouchBackend : HTML5Backend;
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const { zoom, zoomToPoint } = useTimelineZoom(containerRef);

  // Handle zoom gestures
  useZoomGestures(containerRef, {
    onZoom: zoomToPoint,
    scrollPosition,
  });

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    setScrollPosition({
      x: target.scrollLeft,
      y: target.scrollTop,
    });

    const trackListContainer = document.querySelector(".track-list-container");
    if (trackListContainer) {
      trackListContainer.scrollTop = target.scrollTop;
    }
  };

  return (
    <DndProvider backend={backend}>
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
              <UnifiedTimelineGrid
                zoom={zoom}
                scrollPosition={scrollPosition}
              />
              <Playhead
                position={Tone.getTransport().seconds}
                zoom={zoom}
                scrollX={scrollPosition.x}
              />
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
