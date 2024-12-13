// src/features/session/components/SessionView.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { SessionGrid } from "./SessionGrid/SessionGrid";

interface SessionViewProps {
  className?: string;
}

export const SessionView: React.FC<SessionViewProps> = ({ className }) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <SessionGrid />
    </div>
  );
};
