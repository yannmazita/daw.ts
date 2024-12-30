// src/features/arrangement/components/ClipView.tsx
import { useState, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { cn } from "@/common/shadcn/lib/utils";
import * as Tone from "tone";
import { DragTypes } from "@/features/arrangement/types";
import { Slider } from "@/common/shadcn/ui/slider";
import { useClipEngine } from "@/core/engines/EngineManager";
import { Button } from "@/common/shadcn/ui/button";
import { Play, Pause, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { Input } from "@/common/shadcn/ui/input";
import {
  formatTime,
  parseTime,
  isValidTimeString,
} from "@/features/transport/utils/timeUtils";

interface ClipViewProps {
  clipId: string;
  trackId: string;
  zoom: number;
}

const useClipState = (clipId: string) => {
  return useEngineStore((state) => {
    const clip = state.clips.activeClips[clipId]?.clip;
    const content = clip ? state.clips.contents[clip.contentId] : null;
    const isPlaying = clip
      ? state.clips.independentPlayback[clip.contentId]
      : false;
    return { clip, content, isPlaying };
  });
};

export const ClipView: React.FC<ClipViewProps> = ({
  clipId,
  trackId,
  zoom,
}) => {
  const { clip, content, isPlaying } = useClipState(clipId);
  const clipEngine = useClipEngine();
  const [isEditingLoop, setIsEditingLoop] = useState(false);
  const [localStart, setLocalStart] = useState(
    formatTime(clip?.loop?.start ?? 0),
  );
  const [localDuration, setLocalDuration] = useState(
    formatTime(clip?.loop?.duration ?? 0),
  );
  const [errors, setErrors] = useState({
    start: false,
    duration: false,
  });
  const [localGain, setLocalGain] = useState(clip?.gain ?? 0);
  const [localFadeIn, setLocalFadeIn] = useState(formatTime(clip?.fadeIn ?? 0));
  const [localFadeOut, setLocalFadeOut] = useState(
    formatTime(clip?.fadeOut ?? 0),
  );

  if (!clip || !content) return null;

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: clipId,
      data: {
        type: DragTypes.CLIP,
        id: clipId,
        trackId,
        contentId: clip.contentId,
        startTime: Tone.Time(clip.startTime).toSeconds(),
        duration: Tone.Time(clip.duration).toSeconds(),
      },
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  // Use empty image as drag preview
  useEffect(() => {
    //preview(getEmptyImage(), { captureDraggingState: true });
  }, []);

  const clipWidth = Tone.Time(clip.duration).toSeconds() * zoom;
  const clipLeft = Tone.Time(clip.startTime).toSeconds() * zoom;

  const handleLoopToggle = useCallback(
    (enabled: boolean) => {
      try {
        clipEngine.setClipLoop(clipId, enabled, {
          start: parseTime(localStart) ?? 0,
          duration: parseTime(localDuration) ?? 0,
        });
      } catch (error) {
        console.error("Failed to toggle loop:", error);
      }
    },
    [clipEngine, clipId, localStart, localDuration],
  );

  const validateAndUpdateLoop = useCallback(() => {
    const startTime = parseTime(localStart);
    const durationTime = parseTime(localDuration);

    const newErrors = {
      start: !isValidTimeString(localStart) || startTime === null,
      duration: !isValidTimeString(localDuration) || durationTime === null,
    };

    setErrors(newErrors);

    if (
      startTime !== null &&
      durationTime !== null &&
      !newErrors.start &&
      !newErrors.duration
    ) {
      clipEngine.setClipLoop(clipId, clip.loop?.enabled ?? false, {
        start: startTime,
        duration: durationTime,
      });
    }
  }, [clipEngine, clipId, localStart, localDuration, clip?.loop?.enabled]);

  const handleGainChange = (values: number[]) => {
    const gain = values[0];
    setLocalGain(gain);
    clipEngine.setClipGain(clipId, gain);
  };

  const handleFadeChange = useCallback(
    (type: "fadeIn" | "fadeOut", value: string) => {
      const parsedTime = parseTime(value);
      if (parsedTime !== null) {
        if (type === "fadeIn") {
          setLocalFadeIn(value);
        } else {
          setLocalFadeOut(value);
        }
        clipEngine.setClipFades(
          clipId,
          type === "fadeIn" ? parsedTime : (parseTime(localFadeIn) ?? 0),
          type === "fadeOut" ? parsedTime : (parseTime(localFadeOut) ?? 0),
        );
      } else {
        if (type === "fadeIn") {
          setLocalFadeIn(localFadeIn);
        } else {
          setLocalFadeOut(localFadeOut);
        }
      }
    },
    [clipEngine, clipId, localFadeIn, localFadeOut],
  );

  const handleIndependentPlay = () => {
    if (isPlaying) {
      clipEngine.stopClip(clipId);
    } else {
      clipEngine.playClip(clipId);
    }
  };

  const handleDeleteClip = () => {
    clipEngine.removeClip(clipId);
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute h-full rounded-sm border border-border",
        "bg-accent hover:bg-accent/80",
        isDragging && "opacity-50",
        content.type === "audio" && "bg-blue-500/30",
        content.type === "midi" && "bg-green-500/30",
      )}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
        ...style,
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between p-1 text-xs font-medium">
        {content.name}
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 p-0"
            onClick={handleIndependentPlay}
          >
            {isPlaying ? (
              <Pause className="h-3 w-3" />
            ) : (
              <Play className="h-3 w-3" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto h-4 w-4 p-0"
              >
                <Settings className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onSelect={() => setIsEditingLoop(!isEditingLoop)}
              >
                {isEditingLoop ? "Hide Loop Settings" : "Show Loop Settings"}
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={handleDeleteClip}
                className="text-destructive"
              >
                <Trash className="mr-2 h-3 w-3" />
                Delete Clip
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {isEditingLoop && (
        <div className="flex flex-col gap-1 p-1">
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={localStart}
              onChange={(e) => setLocalStart(e.target.value)}
              onBlur={validateAndUpdateLoop}
              className={`w-16 text-xs ${errors.start ? "border-red-500" : ""}`}
              placeholder="0:0:0"
              aria-label="Loop start time"
              title="Loop start time"
            />
            <Input
              type="text"
              value={localDuration}
              onChange={(e) => setLocalDuration(e.target.value)}
              onBlur={validateAndUpdateLoop}
              className={`w-16 text-xs ${errors.duration ? "border-red-500" : ""}`}
              placeholder="0:0:0"
              aria-label="Loop duration"
              title="Loop duration"
            />
            <Button
              variant={clip.loop?.enabled ? "default" : "ghost"}
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => handleLoopToggle(!clip.loop?.enabled)}
            >
              loop
            </Button>
          </div>
          <div className="flex items-center gap-1">
            <Input
              type="text"
              value={localFadeIn}
              onChange={(e) => handleFadeChange("fadeIn", e.target.value)}
              className="w-16 text-xs"
              placeholder="0:0:0"
              aria-label="Fade in time"
              title="Fade in time"
            />
            <Input
              type="text"
              value={localFadeOut}
              onChange={(e) => handleFadeChange("fadeOut", e.target.value)}
              className="w-16 text-xs"
              placeholder="0:0:0"
              aria-label="Fade out time"
              title="Fade out time"
            />
          </div>
          <div className="flex items-center">
            <Slider
              value={[localGain]}
              max={6}
              min={-70}
              step={0.1}
              className="w-full"
              onValueChange={handleGainChange}
            />
          </div>
        </div>
      )}
      {/* TODO: Add waveform visualization for audio clips */}
    </div>
  );
};
