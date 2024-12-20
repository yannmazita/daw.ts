// src/common/components/PlaybackControls/TempoTap.tsx

import { Button } from "@/common/shadcn/ui/button";
import { useState, useEffect, useCallback } from "react";

export const TempoTap: React.FC = () => {
  const { tap, resetTapTempo } = useStore();
  const [tapCount, setTapCount] = useState(0);
  const [isActive, setIsActive] = useState(false);

  // Reset visual state after inactivity
  useEffect(() => {
    if (isActive) {
      const timeout = setTimeout(() => {
        setIsActive(false);
        setTapCount(0);
      }, 2000);

      return () => clearTimeout(timeout);
    }
  }, [isActive, tapCount]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "t" && !event.repeat) {
        handleTap();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleTap = useCallback(() => {
    setIsActive(true);
    setTapCount((prev) => prev + 1);
    tap();
  }, [tap]);

  // Cleanup on unmount
  useEffect(() => {
    return () => resetTapTempo();
  }, [resetTapTempo]);

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
    </div>
  );
};
