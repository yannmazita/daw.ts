// src/features/composition/components/TrackLane.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { Clip } from "@/features/clips/components/Clip";
import { useSoundChainOperations } from "@/features/mix/hooks/useSoundChainOperations";

interface TrackLaneProps {
  trackId: string;
  className?: string;
  isPlaceholder?: boolean;
  onClick?: () => void;
}

export const TrackLane: React.FC<TrackLaneProps> = ({
  trackId,
  className,
  isPlaceholder = false,
  onClick,
}) => {
  const { createSoundChain } = useSoundChainOperations();
  /*
  const trackClipIds = useMemo(() => {
    return Object.keys(clips).filter(
      (clipId) => clips[clipId].parentId === trackId,
    );
  }, [clips, trackId]);
  */
  const trackClipIds: string[] = [];

  if (isPlaceholder) {
    return (
      <div
        className={cn(
          "relative h-24 w-max min-w-full border-b border-dashed border-border bg-muted opacity-50",
          className,
        )}
      />
    );
  }

  return (
    <>
      <div
        className={cn(
          "relative h-24 w-max min-w-full border-b border-border bg-muted",
          className,
        )}
        onClick={onClick}
      >
        {trackClipIds.map((clipId: string) => (
          <Clip key={clipId} clipId={clipId} />
        ))}
      </div>
    </>
  );
};
