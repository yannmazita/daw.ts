// src/features/arrangement/components/DraggableTrackHeader.tsx
import { useRef } from "react";
import { useDraggable, useDroppable, UniqueIdentifier } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Track, DragTypes } from "../types";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { cn } from "@/common/shadcn/lib/utils";
import { useSortable } from "@dnd-kit/sortable";

interface TrackDragItem {
  type: typeof DragTypes.TRACK;
  id: string;
  index: number;
}

interface DraggableTrackHeaderProps {
  track: Track;
  index: number;
  children: React.ReactNode;
}

export const DraggableTrackHeader: React.FC<DraggableTrackHeaderProps> = ({
  track,
  index,
  children,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const arrangementEngine = useArrangementEngine();

  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useSortable({
      id: track.id,
      data: {
        type: DragTypes.TRACK,
        id: track.id,
        index,
      },
      disabled: track.type === "master",
    });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "transition-colors",
        isDragging && "opacity-50",
        "touch-none",
      )}
      style={style}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  );
};
