// src/features/mixer/hooks/useMeterUpdate.ts

import { useEffect, useState } from "react";
import { audioGraphManager } from "../services/audioGraphManagerInstance";

export const useMeterUpdate = (channelId: string) => {
  const [meterData, setMeterData] = useState({
    current: -Infinity,
    peak: -Infinity,
    clip: false,
  });

  useEffect(() => {
    let peakDecayTimeout: number;
    let clipResetTimeout: number;
    let animationFrame: number;

    const update = () => {
      const meter = audioGraphManager.getMeter(channelId);
      if (!meter) return;

      const value = meter.getValue() as number;
      const normalizedValue = (value + 70) / 76; // Normalize -70dB to +6dB

      setMeterData((prev) => {
        const newPeak = Math.max(normalizedValue, prev.peak);
        const isClipping = normalizedValue >= 1;

        if (isClipping) {
          clearTimeout(clipResetTimeout);
          clipResetTimeout = window.setTimeout(() => {
            setMeterData((p) => ({ ...p, clip: false }));
          }, 1000);
        }

        clearTimeout(peakDecayTimeout);
        peakDecayTimeout = window.setTimeout(() => {
          setMeterData((p) => ({ ...p, peak: p.peak * 0.95 }));
        }, 1000);

        return {
          current: normalizedValue,
          peak: newPeak,
          clip: isClipping || prev.clip,
        };
      });

      animationFrame = requestAnimationFrame(update);
    };

    update();

    return () => {
      cancelAnimationFrame(animationFrame);
      clearTimeout(peakDecayTimeout);
      clearTimeout(clipResetTimeout);
    };
  }, [channelId]);

  return meterData;
};
