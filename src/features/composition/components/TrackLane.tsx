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
import { useCallback, useRef, useMemo } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";

interface TrackLaneProps {
  trackId: string;
  className?: string;
}

export const TrackLane: React.FC<TrackLaneProps> = ({ trackId, className }) => {
  const { handleClickedTrack } = useSelection();
  const { importMidi, createClip } = useClipOperations();
  const { tracks } = useTrackOperations();
  const track = tracks[trackId];
  const clips = useEngineStore((state) => state.clips.clips);

  const trackClipIds = useMemo(() => {
    return Object.keys(clips).filter(
      (clipId) => clips[clipId].parentId === trackId,
    );
  }, [clips, trackId]);

  console.log("TrackLane Render:", { trackId, clips });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportMidi = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await importMidi(file, undefined, trackId);
      } catch (error) {
        console.error("Error importing MIDI:", error);
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [importMidi, track?.type, trackId, clips],
  );

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
          <>
            <ContextMenuItem onClick={handleImportMidi}>
              Import MIDI
            </ContextMenuItem>
            <ContextMenuItem onClick={() => createClip("midi", 0, trackId)}>
              Create MIDI Clip
            </ContextMenuItem>
          </>
        )}
        {track?.type === "audio" && (
          <ContextMenuItem onClick={() => createClip("audio", 0, trackId)}>
            Create Audio Clip
          </ContextMenuItem>
        )}
      </ContextMenuContent>
      <input
        type="file"
        accept=".mid,.midi"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </ContextMenu>
  );
};
