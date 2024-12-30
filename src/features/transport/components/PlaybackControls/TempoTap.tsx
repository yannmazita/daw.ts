// src/features/transport/components/PlaybackControls/TempoTap.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useEffect, useCallback } from "react";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const TempoTap: React.FC = () => {
  const transportEngine = useTransportEngine();
  const tapTimes = useEngineStore((state) => state.transport.tapTimes);

  const handleTap = useCallback(() => {
    transportEngine.startTapTempo();
  }, [transportEngine]);

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
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTap}
        className={`px-3 py-1 transition-colors ${
          tapTimes.length > 0
            ? "bg-muted-foreground dark:bg-muted-foreground"
            : ""
        }`}
      >
        {tapTimes.length > 0 ? `Tap (${tapTimes.length})` : "Tap Tempo"}
      </Button>
    </div>
  );
};
