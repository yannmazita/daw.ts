// src/features/arrangement/components/ArrangementView.tsx
import { useRef, useState } from "react";
import { UnifiedTimelineGrid } from "./UnifiedTimelineGrid";
import { CustomDragLayer } from "./CustomDragLayer";
import { TrackList } from "./TrackList";
import { Playhead } from "./Playhead";
import { GRID_CONSTANTS } from "../utils/constants";
import { useTimelineZoom } from "../hooks/useTimelineZoom";
import { useZoomGestures } from "../hooks/useZoomGestures";
import * as Tone from "tone";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { TrackContent } from "./TrackContent";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

export const ArrangementView = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState({ x: 0, y: 0 });
  const { zoom, zoomToPoint } = useTimelineZoom(containerRef);
  const trackOrder = useEngineStore((state) => state.arrangement.trackOrder);

  // Handle zoom gestures
  useZoomGestures(containerRef, {
    onZoom: zoomToPoint,
    scrollPosition,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

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
    <DndContext collisionDetection={closestCenter} sensors={sensors}>
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
              {trackOrder.map((trackId) => (
                <div
                  key={trackId}
                  className="absolute left-0 top-0 h-full w-full"
                  style={{
                    transform: `translateY(${
                      GRID_CONSTANTS.RULER_HEIGHT +
                      (useEngineStore.getState().arrangement.tracks[trackId]
                        ?.index ?? 0) *
                        GRID_CONSTANTS.TRACK_HEIGHT
                    }px)`,
                  }}
                >
                  <TrackContent trackId={trackId} zoom={zoom} />
                </div>
              ))}
              <Playhead
                position={Tone.getTransport().seconds}
                zoom={zoom}
                scrollX={scrollPosition.x}
              />
            </div>
          </div>
        </div>
        <CustomDragLayer zoom={zoom} />
      </div>
    </DndContext>
  );
};
