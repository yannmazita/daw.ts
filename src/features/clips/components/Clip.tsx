// src/features/composition/components/Clip.tsx
import { useEngineStore } from "@/core/stores/useEngineStore";
import { cn } from "@/common/shadcn/lib/utils";
import * as Tone from "tone";

interface ClipProps {
  clipId: string;
}

export const Clip: React.FC<ClipProps> = ({ clipId }) => {
  const activeClips = useEngineStore((state) => state.clips.activeClips);
  const contents = useEngineStore((state) => state.clips.contents);

  const activeClip = activeClips[clipId];

  if (!activeClip) {
    return null;
  }

  const { contentId, startTime, duration } = activeClip.clip;
  const content = contents[contentId];

  if (!content) {
    return null;
  }

  // direct use of Tone -> bad
  const clipWidth = Tone.Time(duration).toSeconds() * 50; // 50px per second for now

  return (
    <div
      className={cn(
        "absolute top-2 h-10 rounded border border-border bg-accent text-center text-foreground",
        content.type === "midi" && "bg-primary",
      )}
      style={{
        left: `${Tone.Time(startTime).toSeconds() * 50}px`, // 50px per second for now
        width: `${clipWidth}px`,
      }}
    >
      {content.name}
    </div>
  );
};
