// src/features/arrangement/components/CustomDragLayer.tsx
import { ClipDragItem, DragTypes } from "@/features/arrangement/types";
import { useDndContext } from "@dnd-kit/core";
import * as Tone from "tone";

interface CustomDragLayerProps {
  zoom: number;
}

export const CustomDragLayer: React.FC<CustomDragLayerProps> = ({ zoom }) => {
  const { active } = useDndContext();

  if (!active?.data) {
    return null;
  }

  const { type, ...item } = active.data.current as ClipDragItem;

  if (type === DragTypes.CLIP) {
    return (
      <div className="pointer-events-none fixed left-0 top-0 z-50">
        <div
          className="rounded-sm border border-primary bg-accent/80 p-1"
          style={{
            width: `${Tone.Time(item.duration).toSeconds() * zoom}px`,
          }}
        >
          {/* todo: Add clip preview content */}
        </div>
      </div>
    );
  }

  return null;
};
