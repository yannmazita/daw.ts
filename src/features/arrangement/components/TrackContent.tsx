// src/features/arrangement/components/TrackContent.tsx
import { useCallback, useRef } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import {
  useArrangementEngine,
  useClipEngine,
} from "@/core/engines/EngineManager";
import { ClipView } from "./ClipView";
import * as Tone from "tone";
import { cn } from "@/common/shadcn/lib/utils";
import { ClipDragItem, DragTypes } from "@/features/arrangement/types";
import {
  useDroppable,
  DndContext,
  DragOverEvent,
  DragEndEvent,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";

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

export const TrackContent: React.FC<TrackContentProps> = ({
  trackId,
  zoom,
}) => {
  const clipIds = useTrackClips(trackId);
  const arrangementEngine = useArrangementEngine();
  const clipEngine = useClipEngine();
  const dropRef = useRef<HTMLDivElement>(null);

  const snapToGrid = useCallback((time: number): number => {
    // todo: Get grid settings from state
    const gridSize = Tone.Time("16n").toSeconds(); // Default to 16th notes
    return Math.round(time / gridSize) * gridSize;
  }, []);

  const { setNodeRef, isOver } = useDroppable({
    id: trackId,
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor),
  );

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeItem = active.data?.current as ClipDragItem;

    if (activeItem && activeItem.type === DragTypes.CLIP) {
      const dropOffset = event.pointerPosition;
      if (!dropOffset || !dropRef.current) return;

      const targetRect = dropRef.current.getBoundingClientRect();
      const relativeX = dropOffset.x - targetRect.left;

      const newTime = snapToGrid(relativeX / zoom);
      activeItem.startTime = newTime;
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const activeItem = active.data?.current as ClipDragItem;

    if (activeItem && activeItem.type === DragTypes.CLIP) {
      const dropOffset = event.pointerPosition;
      if (!dropOffset || !dropRef.current) return;

      const targetRect = dropRef.current.getBoundingClientRect();
      const relativeX = dropOffset.x - targetRect.left;
      const newTime = snapToGrid(relativeX / zoom);

      if (activeItem.trackId === trackId) {
        // Move clip within same track
        clipEngine.moveClip(activeItem.id, newTime);
      } else {
        // Move clip to different track
        clipEngine.removeClip(activeItem.id);
        clipEngine.addClip(activeItem.contentId, newTime);
      }
    }
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      sensors={sensors}
    >
      <div
        ref={setNodeRef}
        className={cn("relative h-full w-full", isOver && "bg-primary/10")}
      >
        <div ref={dropRef} className="relative h-full w-full">
          {clipIds.map((clipId) => (
            <ClipView
              key={clipId}
              clipId={clipId}
              trackId={trackId}
              zoom={zoom}
            />
          ))}
        </div>
      </div>
    </DndContext>
  );
};
