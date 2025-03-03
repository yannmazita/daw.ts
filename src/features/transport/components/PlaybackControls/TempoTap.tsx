// src/features/transport/components/PlaybackControls/TempoTap.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useEffect, useCallback } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportControls } from "../../hooks/useTransportControls";

export const TempoTap: React.FC = () => {
  const tapTimes = useEngineStore((state) => state.transport.tapTimes);
  const { startTapTempo } = useTransportControls();

  const handleTap = useCallback(() => {
    startTapTempo();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "t" && !event.repeat) {
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap]);

  return (
    <div className="flex items-center gap-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTap}
        className={`h-5 w-14 rounded-none py-1 transition-colors ${
          tapTimes.length > 0
            ? "bg-muted-foreground dark:bg-muted-foreground"
            : ""
        }`}
      >
        {tapTimes.length > 0 ? `Tap (${tapTimes.length})` : "Tap"}
      </Button>
    </div>
  );
};
