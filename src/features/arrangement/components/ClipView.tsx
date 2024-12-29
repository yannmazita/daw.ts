// src/features/arrangement/components/ClipView.tsx
import { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useEffect } from 'react';
import { useEngineStore } from '@/core/stores/useEngineStore';
import { cn } from '@/common/shadcn/lib/utils';
import * as Tone from 'tone';
import { ClipDragItem, DragTypes } from '@/features/arrangement/types';

interface ClipViewProps {
  clipId: string;
  trackId: string;
  zoom: number;
}

interface DragCollectedProps {
  isDragging: boolean;
}

const useClipState = (clipId: string) => {
  return useEngineStore((state) => {
    const clip = state.clips.activeClips[clipId]?.clip;
    const content = clip ? state.clips.contents[clip.contentId] : null;
    return { clip, content };
  });
};

export const ClipView: React.FC<ClipViewProps> = ({ clipId, trackId, zoom }) => {
  const ref = useRef<HTMLDivElement>(null);
  const { clip, content } = useClipState(clipId);

  if (!clip || !content) return null;

  const [{ isDragging }, drag, preview] = useDrag<
    ClipDragItem,
    void,
    DragCollectedProps
  >(() => ({
    type: DragTypes.CLIP,
    item: {
      type: DragTypes.CLIP,
      id: clipId,
      trackId,
      contentId: clip.contentId,
      startTime: Tone.Time(clip.startTime).toSeconds(),
      duration: Tone.Time(clip.duration).toSeconds(),
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }), [clipId, trackId, clip]);

  // Use empty image as drag preview
  useEffect(() => {
    preview(getEmptyImage(), { captureDraggingState: true });
  }, [preview]);

  const clipWidth = Tone.Time(clip.duration).toSeconds() * zoom;
  const clipLeft = Tone.Time(clip.startTime).toSeconds() * zoom;

  return (
    <div
      ref={drag(ref)}
      className={cn(
        "absolute h-full rounded-sm border border-border",
        "bg-accent hover:bg-accent/80",
        isDragging && "opacity-50",
        content.type === "audio" && "bg-blue-500/30",
        content.type === "midi" && "bg-green-500/30"
      )}
      style={{
        left: `${clipLeft}px`,
        width: `${clipWidth}px`,
      }}
    >
      <div className="p-1 text-xs font-medium">
        {content.name}
      </div>
      {/* TODO: Add waveform visualization for audio clips */}
    </div>
  );
};
