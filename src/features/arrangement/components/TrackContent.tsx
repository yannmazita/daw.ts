// src/features/arrangement/components/TrackContent.tsx
import { useDrop } from 'react-dnd';
import { useCallback } from 'react';
import { useEngineStore } from '@/core/stores/useEngineStore';
import { useArrangementEngine } from '@/core/engines/EngineManager';
import { ClipView } from './ClipView';
import * as Tone from 'tone';
import { cn } from '@/common/shadcn/lib/utils';
import { ClipDragItem, DragTypes } from '@/features/arrangement/types';

interface TrackContentProps {
  trackId: string;
  zoom: number;
}

interface DropCollectedProps {
  isOver: boolean;
  canDrop: boolean;
}

const useTrackClips = (trackId: string) => {
  return useEngineStore((state) => {
    const track = state.arrangement.tracks[trackId];
    return track?.clipIds || [];
  });
};

export const TrackContent: React.FC<TrackContentProps> = ({ trackId, zoom }) => {
  const clipIds = useTrackClips(trackId);
  const arrangementEngine = useArrangementEngine();

  const snapToGrid = useCallback((time: number): number => {
    // todo: Get grid settings from state
    const gridSize = Tone.Time('16n').toSeconds(); // Default to 16th notes
    return Math.round(time / gridSize) * gridSize;
  }, []);

  const [{ isOver, canDrop }, drop] = useDrop<
    ClipDragItem,
    void,
    DropCollectedProps
  >(() => ({
    accept: DragTypes.CLIP,
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
    canDrop: (item) => {
      // todo: Add validation based on track and clip types
      return true;
    },
    hover: (item, monitor) => {
      if (!monitor.isOver({ shallow: true })) return;

      const dropOffset = monitor.getClientOffset();
      if (!dropOffset) return;

      // Convert client coordinates to time
      const element = monitor.getTargetRect();
      if (!element) return;

      const relativeX = dropOffset.x - element.left;
      const newTime = snapToGrid(relativeX / zoom);

      // Update drag preview position
      item.startTime = newTime;
    },
    drop: (item, monitor) => {
      const dropOffset = monitor.getClientOffset();
      if (!dropOffset) return;

      const element = monitor.getTargetRect();
      if (!element) return;

      const relativeX = dropOffset.x - element.left;
      const newTime = snapToGrid(relativeX / zoom);

      if (item.trackId === trackId) {
        // Move clip within same track
        arrangementEngine.moveClip(item.id, newTime);
      } else {
        // Move clip to different track
        // todo: Implement cross-track movement
      }
    },
  }), [trackId, zoom, snapToGrid]);

  return (
    <div
      ref={drop}
      className={cn(
        "relative h-full w-full",
        isOver && canDrop && "bg-primary/10",
        isOver && !canDrop && "bg-destructive/10"
      )}
    >
      {clipIds.map((clipId) => (
        <ClipView
          key={clipId}
          clipId={clipId}
          trackId={trackId}
          zoom={zoom}
        />
      ))}
    </div>
  );
};
