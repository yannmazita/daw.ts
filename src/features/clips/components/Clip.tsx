// src/features/composition/components/Clip.tsx
import { cn } from "@/common/shadcn/lib/utils";
import * as Tone from "tone";
import { useClipOperations } from "../hooks/useClipOperations";
import { useClipControls } from "../hooks/useClipControls";
import { useCallback, useRef } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";

interface ClipProps {
  clipId: string;
}

export const Clip: React.FC<ClipProps> = ({ clipId }) => {
  const { importMidi } = useClipOperations();
  const { clip, playClip, pauseClip, stopClip } = useClipControls(clipId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportMidi = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await importMidi(file, clipId, undefined);
      } catch (error) {
        console.error("Error importing MIDI:", error);
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [importMidi],
  );

  if (!clip) {
    return null;
  }

  const clipWidth = clip.duration * 50; // 50px per second for now

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div
          className={cn(
            "absolute top-2 h-10 rounded border border-border bg-accent text-center text-foreground",
            clip.type === "midi" && "bg-primary",
          )}
          style={{
            left: `${Tone.Time(clip.startTime).toSeconds() * 50}px`, // 50px per second for now
            width: `${clipWidth}px`,
          }}
        >
          {clip.name}
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent>
        <>
          {clip.type === "midi" && (
            <ContextMenuItem onClick={handleImportMidi}>
              Import MIDI
            </ContextMenuItem>
          )}
          <ContextMenuItem onClick={() => playClip()}>
            Play Clip
          </ContextMenuItem>
          <ContextMenuItem onClick={() => pauseClip()}>
            Pause Clip
          </ContextMenuItem>
          <ContextMenuItem onClick={() => stopClip()}>
            Stop Clip
          </ContextMenuItem>
        </>
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
