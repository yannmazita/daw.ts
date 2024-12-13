// src/features/session/components/ClipSlot/ClipSlot.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { ClipState } from "@/core/types/common";
import { useStore } from "@/common/slices/useStore";
import { EmptySlot } from "./EmptySlot";
import { FilledSlot } from "./FilledSlot";

interface ClipSlotProps {
  trackId: string;
  index: number;
}

export const ClipSlot: React.FC<ClipSlotProps> = ({ trackId, index }) => {
  const pattern = useStore((state) => state.getPatternAtSlot(trackId, index));
  const clipState = useStore((state) => state.getClipState(trackId, index));

  // If no pattern, render EmptySlot
  if (!pattern) {
    return (
      <div
        className={cn(
          "relative h-24 border-b border-border",
          "bg-background", // Empty slot styling
        )}
      >
        <EmptySlot trackId={trackId} index={index} />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "relative h-24 border-b border-border",
        clipState === ClipState.EMPTY && "bg-background",
        clipState === ClipState.STOPPED && "bg-secondary",
        clipState === ClipState.PLAYING && "bg-primary",
        clipState === ClipState.QUEUED && "bg-primary/50",
        clipState === ClipState.RECORDING && "bg-destructive",
      )}
    >
      {pattern ? (
        <FilledSlot
          pattern={pattern}
          trackId={trackId}
          index={index}
          state={clipState}
        />
      ) : (
        <EmptySlot trackId={trackId} index={index} />
      )}
    </div>
  );
};
