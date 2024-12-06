// src/features/sequencer/hooks/playback/useTimingController.ts

import { useCallback, useRef } from "react";
import * as Tone from "tone";
import { PlaybackContext } from "./types";

export const useTimingController = () => {
  const lastUpdateTime = useRef(0);
  const frameId = useRef<number>();

  const updatePosition = useCallback((context: PlaybackContext) => {
    const transport = Tone.getTransport();
    const currentTime = transport.seconds;
    const position = transport.position as string;
    const [bars, beats, sixteenths] = position.split(":").map(Number);

    // Handle loop points
    if (context.loopEnabled && bars >= context.loopEnd) {
      transport.seconds = context.loopStart * (240 / context.bpm);
    }

    return {
      currentTime,
      currentBar: bars,
      currentBeat: beats,
      currentStep: Math.floor(sixteenths * 4),
    };
  }, []);

  const startTimingLoop = useCallback(
    (onUpdate: () => void, context: PlaybackContext) => {
      const updateTiming = (timestamp: number) => {
        if (timestamp - lastUpdateTime.current >= 1000 / 60) {
          // 60fps
          onUpdate();
          lastUpdateTime.current = timestamp;
        }
        frameId.current = requestAnimationFrame(updateTiming);
      };

      frameId.current = requestAnimationFrame(updateTiming);

      return () => {
        if (frameId.current) {
          cancelAnimationFrame(frameId.current);
        }
      };
    },
    [],
  );

  const stopTimingLoop = useCallback(() => {
    if (frameId.current) {
      cancelAnimationFrame(frameId.current);
    }
  }, []);

  return {
    updatePosition,
    startTimingLoop,
    stopTimingLoop,
  };
};
