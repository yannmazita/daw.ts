// src/features/session/components/ClipSlot/FilledSlot.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useStore } from "@/common/slices/useStore";
import { Pattern } from "@/core/interfaces/pattern";
import { ClipState } from "@/core/types/common";
import { FilledSlotContextMenu } from "./FilledSlotContextMenu";
import { cn } from "@/common/shadcn/lib/utils";
import { useCallback } from "react";
import { Square } from "lucide-react";

interface FilledSlotProps {
  pattern: Pattern;
  trackId: string;
  index: number;
  state: ClipState;
}

export const FilledSlot: React.FC<FilledSlotProps> = ({
  pattern,
  trackId,
  index,
  state,
}) => {
  const launchClip = useStore((state) => state.addPlaylistPattern);
  const stopClip = useStore((state) => state.removePlaylistPattern);
  const clipQuantization = useStore((state) => state.clipQuantization);

  const handleClick = useCallback(() => {
    switch (state) {
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
  }, [state, trackId, pattern.id, index, launchClip, stopClip]);

  return (
    <FilledSlotContextMenu pattern={pattern} trackId={trackId} index={index}>
      <Button
        variant="ghost"
        className={cn(
          "h-full w-full flex-col items-start justify-between rounded-none p-2",
          "transition-colors duration-100",
          state === ClipState.PLAYING && "bg-primary text-primary-foreground",
          state === ClipState.QUEUED && "bg-primary/50",
          state === ClipState.RECORDING &&
            "bg-destructive text-destructive-foreground",
        )}
        onClick={handleClick}
      >
        {/* Pattern Info */}
        <div className="flex w-full items-start justify-between">
          <span className="truncate text-xs font-medium">{pattern.name}</span>
          {state === ClipState.PLAYING && (
            <Square className="h-3 w-3 animate-pulse" />
          )}
        </div>

        {/* Pattern Details */}
        <div className="flex w-full justify-between text-[10px] opacity-80">
          <span>
            {pattern.timeSignature[0]}/{pattern.timeSignature[1]}
          </span>
          <span># PATTERN DURATION</span>
        </div>
      </Button>
    </FilledSlotContextMenu>
  );
};
