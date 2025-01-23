// src/features/composition/components/DummyTrack.tsx
import { cn } from "@/common/shadcn/lib/utils";

interface DummyTrackProps {
  className?: string;
  onClick?: () => void;
}

export const DummyTrackHeader: React.FC<DummyTrackProps> = ({
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "flex h-24 w-40 flex-col border-b border-border bg-background/50 px-1 py-2",
        className,
      )}
      onClick={onClick}
    />
  );
};

export const DummyTrackLane: React.FC<DummyTrackProps> = ({
  className,
  onClick,
}) => {
  return (
    <div
      className={cn(
        "relative h-24 w-max min-w-full border-b border-border bg-muted/50",
        className,
      )}
      onClick={onClick}
    />
  );
};
