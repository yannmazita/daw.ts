import { Button } from "@/common/shadcn/ui/button";
import { useState, useEffect, useCallback } from "react";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const TempoTap: React.FC = () => {
  const tempo = useEngineStore((state) => state.transport.tempo);
  const { startTapTempo, endTapTempo } = useTransportEngine();
  const [tapCount, setTapCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const resetTapState = useCallback(() => {
    setTapCount(0);
    setIsActive(false);
    endTapTempo();
  }, [endTapTempo]);

  const handleTap = useCallback(() => {
    setIsActive(true);
    setTapCount((prev) => prev + 1);
    const updatedTempo = startTapTempo(); // Start tap and get updated BPM
    console.log("Updated Tempo:", updatedTempo);
  }, [startTapTempo]);

  // Reset visual state after inactivity
  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => resetTapState(), 2000);
      return () => clearTimeout(timeout);
    }
  }, [isActive, resetTapState]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "t" && !event.repeat) {
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleTap]);

  // Cleanup on unmount
  useEffect(() => {
    return resetTapState;
  }, [resetTapState]);

  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleTap}
        className={`px-3 py-1 transition-colors ${
          isActive ? "bg-muted-foreground dark:bg-muted-foreground" : ""
        }`}
      >
        {isActive ? `Tap (${tapCount})` : "Tap Tempo"}
      </Button>
      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
        Press 'T'
      </span>
      <span className="text-xs text-muted-foreground dark:text-muted-foreground">
        Current Tempo: {tempo} BPM
      </span>
    </div>
  );
};
