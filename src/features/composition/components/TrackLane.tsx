// src/features/composition/components/TrackLane.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { Clip } from "@/features/clips/components/Clip";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import { useTrackOperations } from "../hooks/useTrackOperations";
import { useClipOperations } from "@/features/clips/hooks/useClipOperations";
import { useSelection } from "@/common/hooks/useSelection";

interface TrackLaneProps {
  trackId: string;
  className?: string;
}

export const TrackLane: React.FC<TrackLaneProps> = ({ trackId, className }) => {
  const { handleClickedTrack } = useSelection();
  const { getClipIdsForTrack } = useClipOperations();
  const { createClip } = useClipOperations();
  const { tracks } = useTrackOperations();
  const track = tracks[trackId];
  const trackClipIds = getClipIdsForTrack(trackId);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "relative h-24 w-max min-w-full border-b border-border bg-muted",
            className,
          )}
          onClick={() => handleClickedTrack(trackId)}
        >
          {trackClipIds.map((clipId: string) => (
            <Clip key={clipId} clipId={clipId} />
          ))}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        {track.type === "midi" && (
          <ContextMenuItem onClick={() => createClip("midi", 0, trackId)}>
            Create MIDI Clip
          </ContextMenuItem>
        )}
        {track?.type === "audio" && (
          <ContextMenuItem onClick={() => createClip("audio", 0, trackId)}>
            Create Audio Clip
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
