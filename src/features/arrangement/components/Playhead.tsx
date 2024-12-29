// src/features/arrangement/components/Playhead.tsx
interface PlayheadProps {
  position: number;
  zoom: number;
  scrollX: number;
}

export const Playhead: React.FC<PlayheadProps> = ({ position, zoom, scrollX }) => {
  const pixelPosition = position * zoom - scrollX;

  return (
    <>
      {/* Playhead line */}
      <div
        className="absolute top-0 h-full w-px bg-primary"
        style={{
          left: `${pixelPosition}px`,
        }}
      />
      {/* Playhead handle */}
      <div
        className="absolute -top-1 h-2 w-3 cursor-move bg-primary"
        style={{
          left: `${pixelPosition - 6}px`,
          clipPath: "polygon(50% 100%, 0 0, 100% 0)",
        }}
      />
    </>
  );
};
