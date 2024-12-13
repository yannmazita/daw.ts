// src/features/session/components/ClipSlot/ClipSlot.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { ClipState } from "@/core/types/common";
import { useStore } from "@/common/slices/useStore";
import { useState, useCallback } from "react";

interface ClipSlotProps {
  trackId: string;
  index: number;
}

export const ClipSlot: React.FC<ClipSlotProps> = ({ trackId, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  const pattern = useStore((state) => state.getPatternAtSlot(trackId, index));
  const clipState = useStore((state) => state.getClipState(trackId, index));
  const launchClip = useStore((state) => state.addPlaylistPattern);
  const stopClip = useStore((state) => state.removePlaylistPattern);

  const handleClick = useCallback(() => {
    if (!pattern) return;

    switch (clipState) {
      case ClipState.STOPPED:
        launchClip(trackId, pattern.id, index.toString());
        break;
      case ClipState.PLAYING:
      case ClipState.QUEUED:
        stopClip(trackId, pattern.id);
        break;
      default:
        break;
    }
  }, [pattern, clipState, trackId, index, launchClip, stopClip]);

  return (
    <div
      className={cn(
        "group relative h-24 border-b border-border p-1",
        "cursor-pointer transition-colors duration-100",
        isHovered && "bg-accent",
        clipState === ClipState.EMPTY && "bg-background",
        clipState === ClipState.STOPPED && "bg-secondary",
        clipState === ClipState.PLAYING && "bg-primary",
        clipState === ClipState.QUEUED && "bg-primary/50",
        clipState === ClipState.RECORDING && "bg-destructive",
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {pattern && (
        <div className="flex h-full flex-col p-1">
          <span className="truncate text-xs font-medium">{pattern.name}</span>
          {clipState === ClipState.PLAYING && (
            <div className="absolute bottom-1 right-1 h-2 w-2 rounded-full bg-primary-foreground" />
          )}
        </div>
      )}
    </div>
  );
};
