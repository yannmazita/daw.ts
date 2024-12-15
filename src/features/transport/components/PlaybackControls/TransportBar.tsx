// src/common/components/PlaybackControls/TransportBar.tsx

import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "@/common/slices/useStore";
import * as Tone from "tone";

interface TransportBarProps {
  height?: number;
}

export const TransportBar: React.FC<TransportBarProps> = ({ height = 24 }) => {
  const {
    position,
    length,
    isPlaying,
    isLooping,
    loopStart,
    loopEnd,
    seekTo,
    setLoop,
  } = useStore();
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoopDragging, setIsLoopDragging] = useState<"start" | "end" | null>(
    null,
  );

  // Convert time to pixel position
  const timeToPosition = useCallback(
    (time: number): number => {
      const totalWidth = barRef.current?.clientWidth ?? 0;
      const totalLength = Tone.Time(length).toSeconds();
      return (time * totalWidth) / totalLength;
    },
    [length],
  );

  // Convert pixel position to time
  const positionToTime = useCallback(
    (pos: number): number => {
      const totalWidth = barRef.current?.clientWidth ?? 0;
      const totalLength = Tone.Time(length).toSeconds();
      return (pos * totalLength) / totalWidth;
    },
    [length],
  );

  // Handle mouse interactions
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!barRef.current || isPlaying) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;

    // Check if clicking near loop markers
    if (isLooping) {
      const loopStartPos = timeToPosition(Tone.Time(loopStart).toSeconds());
      const loopEndPos = timeToPosition(Tone.Time(loopEnd).toSeconds());

      if (Math.abs(x - loopStartPos) < 5) {
        setIsLoopDragging("start");
        return;
      }
      if (Math.abs(x - loopEndPos) < 5) {
        setIsLoopDragging("end");
        return;
      }
    }

    setIsDragging(true);
    const newTime = positionToTime(x);
    seekTo(Tone.Time(newTime).toBarsBeatsSixteenths());
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!barRef.current || (!isDragging && !isLoopDragging)) return;

    const rect = barRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const newTime = positionToTime(x);

    if (isDragging) {
      seekTo(Tone.Time(newTime).toBarsBeatsSixteenths());
    } else if (isLoopDragging) {
      const currentLoopStart = Tone.Time(loopStart).toSeconds();
      const currentLoopEnd = Tone.Time(loopEnd).toSeconds();

      if (isLoopDragging === "start" && newTime < currentLoopEnd) {
        setLoop(
          true,
          Tone.Time(newTime).toBarsBeatsSixteenths(),
          Tone.Time(currentLoopEnd).toBarsBeatsSixteenths(),
        );
      } else if (isLoopDragging === "end" && newTime > currentLoopStart) {
        setLoop(
          true,
          Tone.Time(currentLoopStart).toBarsBeatsSixteenths(),
          Tone.Time(newTime).toBarsBeatsSixteenths(),
        );
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsLoopDragging(null);
  };

  // Add and remove event listeners
  useEffect(() => {
    if (isDragging || isLoopDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);

      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, isLoopDragging]);

  return (
    <div
      ref={barRef}
      className="relative w-full cursor-pointer rounded-sm bg-accent"
      style={{ height }}
      onMouseDown={handleMouseDown}
    >
      {/* Loop Region */}
      {isLooping && (
        <div
          className="absolute h-full bg-primary/30"
          style={{
            left: `${timeToPosition(Tone.Time(loopStart).toSeconds())}px`,
            width: `${
              timeToPosition(Tone.Time(loopEnd).toSeconds()) -
              timeToPosition(Tone.Time(loopStart).toSeconds())
            }px`,
          }}
        >
          {/* Loop Markers */}
          <div className="absolute left-0 h-full w-1 cursor-ew-resize bg-primary" />
          <div className="absolute right-0 h-full w-1 cursor-ew-resize bg-primary" />
        </div>
      )}

      {/* Playhead */}
      <div
        className="absolute h-full w-0.5 bg-primary transition-all duration-100"
        style={{
          left: `${timeToPosition(Tone.Time(position).toSeconds())}px`,
          display: position > 0 ? "block" : "none",
        }}
      />

      {/* Beat Markers */}
      <div className="absolute h-full w-full">
        {Array.from({ length: Math.ceil(Tone.Time(length).toSeconds()) }).map(
          (_, i) => (
            <div
              key={i}
              className="absolute h-full w-px bg-border/50"
              style={{ left: `${timeToPosition(i)}px` }}
            />
          ),
        )}
      </div>
    </div>
  );
};
