// src/features/arrangement/components/TrackLane.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { Clip } from "@/features/clips/components/Clip";

interface TrackLaneProps {
  trackId: string;
  className?: string;
}

export const TrackLane: React.FC<TrackLaneProps> = ({ trackId, className }) => {
  const clipIds = useEngineStore(
    (state) => state.arrangement.tracks[trackId].clipIds,
  );

  return (
    <div
      className={cn(
        "relative h-24 w-max min-w-full border-b border-border bg-muted",
        className,
      )}
    >
      {clipIds.map((clipId: string) => (
        <Clip key={clipId} clipId={clipId} />
      ))}
    </div>
  );
};
