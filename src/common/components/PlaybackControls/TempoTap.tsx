// src/common/components/PlaybackControls/TempoTap.tsx

import { useStore } from "@/common/slices/useStore";
import { Button } from "@/common/shadcn/ui/button";
import { useCallback, useRef } from "react";

export function TempoTap() {
  const { setBpm } = useStore();
  const tapsRef = useRef<number[]>([]);
  const timeoutRef = useRef<number>();

  const handleTap = useCallback(() => {
    const now = Date.now();

    // Update taps in ref
    tapsRef.current = [...tapsRef.current, now].slice(-4); // Keep last 4 taps

    if (tapsRef.current.length >= 2) {
      const intervals = tapsRef.current
        .slice(1)
        .map((tap, i) => tap - tapsRef.current[i]);
      const averageInterval =
        intervals.reduce((a, b) => a + b) / intervals.length;
      const bpm = Math.round(60000 / averageInterval);

      if (bpm >= 20 && bpm <= 300) {
        setBpm(bpm);
      }
    }

    // Reset taps after 2 seconds of inactivity
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = window.setTimeout(() => {
      tapsRef.current = [];
    }, 2000);
  }, [setBpm]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleTap}
      className="px-3 py-1"
    >
      Tap
    </Button>
  );
}
