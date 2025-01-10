// src/features/composition/components/Clip.tsx
import { cn } from "@/common/shadcn/lib/utils";
import * as Tone from "tone";
import { useClipOperations } from "../hooks/useClipOperations";
import { useClipControls } from "../hooks/useClipControls";

interface ClipProps {
  clipId: string;
}

export const Clip: React.FC<ClipProps> = ({ clipId }) => {
  const {
    createClip,
    deleteClip,
    moveClip,
    setClipFades,
    playClip,
    pauseClip,
    stopClip,
    getClipPlaybackPosition,
    clips,
  } = useClipOperations();
  const {
    setStartTime,
    setDuration,
    setFadeIn,
    setFadeOut,
    clip,
    fadeIn,
    fadeOut,
    startTime,
    duration,
  } = useClipControls(clipId);

  if (!clip) {
    return null;
  }

  const clipWidth = clip.duration * 50; // 50px per second for now

  return (
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
  );
};
