// src/features/composition/components/DummyTrack.tsx
import { cn } from "@/common/shadcn/lib/utils";

interface DummyTrackProps {
  className?: string;
}

export const DummyTrackHeader: React.FC<DummyTrackProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex h-24 w-40 flex-col border-b border-border bg-background/50 px-1 py-2",
        className,
      )}
    />
  );
};

export const DummyTrackLane: React.FC<DummyTrackProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "relative h-24 w-max min-w-full border-b border-border bg-muted/50",
        className,
      )}
    />
  );
};
