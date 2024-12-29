// src/features/arrangement/components/CustomDragLayer.tsx
import { ClipDragItem, DragTypes } from '@/features/arrangement/types';
import { useDragLayer } from 'react-dnd';
import * as Tone from 'tone';

export const CustomDragLayer: React.FC<{ zoom: number }> = ({ zoom }) => {
  const { itemType, isDragging, item, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem() as ClipDragItem,
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging || !currentOffset) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-50"
      style={{
        transform: `translate(${currentOffset.x}px, ${currentOffset.y}px)`,
      }}
    >
      {itemType === DragTypes.CLIP && (
        <div
          className="rounded-sm border border-primary bg-accent/80 p-1"
          style={{
            width: `${Tone.Time(item.duration).toSeconds() * zoom}px`,
          }}
        >
          {/* todo: Add clip preview content */}
        </div>
      )}
    </div>
  );
};
