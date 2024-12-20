// src/features/transport/components/PlaybackControls/TransportBar.tsx
import { useCallback, useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { Time } from "tone/build/esm/core/type/Units";

interface TransportBarProps {
  height?: number;
  disabled?: boolean;
}

interface DragState {
  type: "playhead" | "loopStart" | "loopEnd" | null;
  initialX: number;
  initialTime: number;
}

const MARKER_SPACING = 24; // pixels between beat markers
const DRAG_THRESHOLD = 5; // pixels
const RESIZE_DELAY = 100; // ms

export const TransportBar: React.FC<TransportBarProps> = ({
  height = 24,
  disabled = false,
}) => {
  const barRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<number>();
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  const transport = useEngineStore((state) => state.transport);
  const transportEngine = useTransportEngine();

  // Memoized conversion functions
  const timeToPosition = useCallback(
    (time: Time): number => {
      const totalWidth = dimensions.width;
      const totalLength = transportEngine.getTransportDuration();
      return (
        (Tone.Time(time).toSeconds() * totalWidth) /
        Tone.Time(totalLength).toSeconds()
      );
    },
    [dimensions.width, transportEngine.getTransportDuration()],
  );

  const positionToTime = useCallback(
    (pos: number): Time => {
      const totalWidth = dimensions.width;
      const totalLength = Tone.Time(
        transportEngine.getTransportDuration(),
      ).toSeconds();
      const seconds = (pos * totalLength) / totalWidth;
      return Tone.Time(seconds).toBarsBeatsSixteenths();
    },
    [dimensions.width, transportEngine.getTransportDuration()],
  );

  // Resize observer with manual debounce
  useEffect(() => {
    if (!barRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        // Clear existing timeout
        if (resizeTimeoutRef.current) {
          window.clearTimeout(resizeTimeoutRef.current);
        }

        // Set new timeout
        resizeTimeoutRef.current = window.setTimeout(() => {
          setDimensions({
            width: entry.contentRect.width,
            height: entry.contentRect.height,
          });
        }, RESIZE_DELAY);
      }
    });

    observer.observe(barRef.current);

    return () => {
      observer.disconnect();
      if (resizeTimeoutRef.current) {
        window.clearTimeout(resizeTimeoutRef.current);
      }
    };
  }, []);

  // Interaction handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (!barRef.current || disabled || transport.isPlaying) return;

      const rect = barRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;

      if (transport.loop.enabled) {
        const loopStartPos = timeToPosition(transport.loop.start);
        const loopEndPos = timeToPosition(transport.loop.end);

        if (Math.abs(x - loopStartPos) < DRAG_THRESHOLD) {
          setDragState({
            type: "loopStart",
            initialX: x,
            initialTime: Tone.Time(transport.loop.start).toSeconds(),
          });
          return;
        }
        if (Math.abs(x - loopEndPos) < DRAG_THRESHOLD) {
          setDragState({
            type: "loopEnd",
            initialX: x,
            initialTime: Tone.Time(transport.loop.end).toSeconds(),
          });
          return;
        }
      }

      setDragState({
        type: "playhead",
        initialX: x,
        initialTime: Tone.getTransport().seconds,
      });

      const newTime = positionToTime(x);
      transportEngine.seekTo(newTime);
    },
    [disabled, transport, timeToPosition, positionToTime, transportEngine],
  );

  const handlePointerMove = useCallback(
    (e: PointerEvent) => {
      if (!barRef.current || !dragState) return;

      const rect = barRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
      const newTime = positionToTime(x);

      switch (dragState.type) {
        case "playhead":
          transportEngine.seekTo(newTime);
          break;
        case "loopStart":
          if (
            Tone.Time(newTime).toSeconds() <
            Tone.Time(transport.loop.end).toSeconds()
          ) {
            transportEngine.setLoopPoints(newTime, transport.loop.end);
          }
          break;
        case "loopEnd":
          if (
            Tone.Time(newTime).toSeconds() >
            Tone.Time(transport.loop.start).toSeconds()
          ) {
            transportEngine.setLoopPoints(transport.loop.start, newTime);
          }
          break;
      }
    },
    [dragState, transport, positionToTime, transportEngine],
  );

  const handlePointerUp = useCallback(() => {
    setDragState(null);
  }, []);

  // Event listeners
  useEffect(() => {
    if (dragState) {
      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
      window.addEventListener("pointercancel", handlePointerUp);

      return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
        window.removeEventListener("pointercancel", handlePointerUp);
      };
    }
  }, [dragState, handlePointerMove, handlePointerUp]);

  // Render beat markers
  const renderBeatMarkers = useCallback(() => {
    const markers = [];
    const totalBeats = Math.ceil(
      Tone.Time(transportEngine.getTransportDuration()).toSeconds(),
    );
    const markerCount = Math.floor(dimensions.width / MARKER_SPACING);

    for (let i = 0; i <= Math.min(totalBeats, markerCount); i++) {
      markers.push(
        <div
          key={i}
          className="absolute h-full w-px bg-border/50"
          style={{ left: `${timeToPosition(i)}px` }}
          aria-hidden="true"
        />,
      );
    }
    return markers;
  }, [
    dimensions.width,
    transportEngine.getTransportDuration(),
    timeToPosition,
  ]);

  return (
    <div
      ref={barRef}
      className={`relative w-full rounded-sm bg-accent ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
      style={{ height }}
      onPointerDown={handlePointerDown}
      role="slider"
      aria-label="Transport position"
      aria-valuemin={0}
      aria-valuemax={Tone.Time(
        transportEngine.getTransportDuration(),
      ).toSeconds()}
      aria-valuenow={Tone.Time(Tone.getTransport().seconds).toSeconds()}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
    >
      {/* Loop Region */}
      {transport.loop.enabled && (
        <div
          className="absolute h-full bg-primary/30"
          style={{
            left: `${timeToPosition(transport.loop.start)}px`,
            width: `${
              timeToPosition(transport.loop.end) -
              timeToPosition(transport.loop.start)
            }px`,
          }}
          role="region"
          aria-label="Loop region"
        >
          <div
            className="absolute left-0 h-full w-1 cursor-ew-resize bg-primary"
            role="separator"
            aria-label="Loop start marker"
          />
          <div
            className="absolute right-0 h-full w-1 cursor-ew-resize bg-primary"
            role="separator"
            aria-label="Loop end marker"
          />
        </div>
      )}

      {/* Playhead */}
      <div
        className="absolute h-full w-0.5 bg-primary transition-transform duration-100"
        style={{
          transform: `translateX(${timeToPosition(Tone.getTransport().seconds)}px)`,
          display:
            Tone.Time(Tone.getTransport().seconds).toSeconds() > 0
              ? "block"
              : "none",
        }}
        role="presentation"
        aria-hidden="true"
      />

      {/* Beat Markers */}
      <div className="absolute h-full w-full">{renderBeatMarkers()}</div>
    </div>
  );
};
