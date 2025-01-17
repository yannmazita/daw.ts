// src/features/composition/components/Clip.tsx
import { cn } from "@/common/shadcn/lib/utils";
import * as Tone from "tone";
import { useClipOperations } from "../hooks/useClipOperations";
import { useClipControls } from "../hooks/useClipControls";
import { useCallback, useRef, useState } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useEngineStore } from "@/core/stores/useEngineStore";

interface ClipProps {
  clipId: string;
}

export const Clip: React.FC<ClipProps> = ({ clipId }) => {
  const { importMidi, setClipInstrument } = useClipOperations();
  const { clip, playClip, pauseClip, stopClip } = useClipControls(clipId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const instruments = useEngineStore((state) => state.sampler.instruments);
  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >(clip?.instrumentId);

  const handleImportMidi = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await importMidi(file, clipId, undefined, selectedInstrument);
      } catch (error) {
        console.error("Error importing MIDI:", error);
      }

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [importMidi, clipId, selectedInstrument],
  );

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
    setClipInstrument(clipId, value);
  };

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
          {clip.type === "midi" && (
            <div className="px-2">
              <Select
                value={selectedInstrument}
                onValueChange={handleInstrumentChange}
              >
                <SelectTrigger
                  className="h-7 w-40 rounded-none py-1 text-left"
                  aria-label="Instrument"
                >
                  <SelectValue placeholder="Select Instrument" />
                </SelectTrigger>
                <SelectContent className="rounded-none">
                  {Object.entries(instruments).map(([id, instrument]) => (
                    <SelectItem key={id} value={id}>
                      {instrument.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
