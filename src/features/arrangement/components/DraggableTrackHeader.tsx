// src/features/arrangement/components/DraggableTrackHeader.tsx
import { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import { Track, DragTypes } from "../types";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { cn } from "@/common/shadcn/lib/utils";

interface TrackDragItem {
  type: typeof DragTypes.TRACK;
  id: string;
  index: number;
}

interface DragCollectedProps {
  isDragging: boolean;
}

interface DropCollectedProps {
  handlerId: string | symbol | null;
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

  const [{ isDragging }, drag] = useDrag<
    TrackDragItem,
    () => void,
    DragCollectedProps
  >(
    () => ({
      type: DragTypes.TRACK,
      item: { type: DragTypes.TRACK, id: track.id, index },
      collect: (monitor) => ({
        isDragging: monitor.isDragging(),
      }),
      canDrag: () => track.type !== "master",
    }),
    [track.id, index],
  );

  const [{ handlerId }, drop] = useDrop<
    TrackDragItem,
    void,
    DropCollectedProps
  >(
    () => ({
      accept: DragTypes.TRACK,
      collect(monitor) {
        return {
          handlerId: monitor.getHandlerId(),
        };
      },
      hover(item: TrackDragItem, monitor) {
        if (!ref.current) return;

        const dragIndex = item.index;
        const hoverIndex = index;

        // Don't replace items with themselves
        if (dragIndex === hoverIndex) return;

        // Get rectangle on screen
        const hoverBoundingRect = ref.current?.getBoundingClientRect();

        // Get vertical middle
        const hoverMiddleY =
          (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
        // Get mouse position
        const clientOffset = monitor.getClientOffset();

        if (!clientOffset) return;

        // Get pixels to the top
        const hoverClientY = clientOffset.y - hoverBoundingRect.top;

        // Dragging downwards
        if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return;
        // Dragging upwards
        if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return;

        // Perform the move
        arrangementEngine.moveTrack(item.id, hoverIndex);
        item.index = hoverIndex;
      },
    }),
    [index],
  );

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={cn(
        "transition-colors",
        isDragging && "opacity-50",
        "touch-none",
      )}
      data-handler-id={handlerId}
    >
      {children}
    </div>
  );
};
