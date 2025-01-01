// src/common/components/Knob/KnobIndicator.tsx

interface KnobIndicatorProps {
  radius: number;
  rotation: number;
}

export const KnobIndicator: React.FC<KnobIndicatorProps> = ({
  radius,
  rotation,
}) => {
  return (
    <div
      className="transform-origin-center absolute h-0.5"
      style={{
        width: `${radius}px`,
        transform: `rotate(${rotation}deg)`,
        top: "50%",
        left: "50%",
        translate: "-50% -50%",
      }}
    >
      <div className="absolute h-full w-full bg-foreground dark:bg-background"></div>
      <div className="absolute right-0 top-1/2 h-1.5 w-1.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-foreground dark:bg-background"></div>
    </div>
  );
};
