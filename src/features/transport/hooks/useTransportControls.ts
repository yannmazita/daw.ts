// src/features/transport/hooks/useTransportControls.ts
import { useCallback } from "react";
import { useCompositionEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";

export const useTransportControls = () => {
  const compositionEngine = useCompositionEngine();
  const transportState = useEngineStore((state) => state.transport);

  const isPlaying = useEngineStore((state) => state.transport.isPlaying);
  const tempo = useEngineStore((state) => state.transport.tempo);
  const timeSignature = useEngineStore(
    (state) => state.transport.timeSignature,
  );
  const tapTimes = useEngineStore((state) => state.transport.tapTimes);
  const loop = useEngineStore((state) => state.transport.loop);
  const duration = useEngineStore((state) => state.transport.duration);
  const position = useEngineStore((state) => state.transport.position);

  const play = useCallback(
    async (time?: number) => {
      await compositionEngine.play(time);
    },
    [compositionEngine],
  );

  const pause = useCallback(() => {
    compositionEngine.pause();
  }, [compositionEngine]);

  const stop = useCallback(() => {
    compositionEngine.stop();
  }, [compositionEngine]);

  const seekTo = useCallback(
    (time: number) => {
      compositionEngine.seekTo(time);
    },
    [compositionEngine],
  );

  const setTempo = useCallback(
    (tempo: number) => {
      compositionEngine.setTempo(tempo);
    },
    [compositionEngine],
  );

  const setTimeSignature = useCallback(
    (numerator: number, denominator: number) => {
      compositionEngine.setTimeSignature(numerator, denominator);
    },
    [compositionEngine],
  );

  const startTapTempo = useCallback(() => {
    compositionEngine.startTapTempo();
  }, [compositionEngine]);

  const endTapTempo = useCallback(() => {
    compositionEngine.endTapTempo();
  }, [compositionEngine]);

  const setLoop = useCallback(
    (enabled: boolean) => {
      compositionEngine.setLoop(enabled);
    },
    [compositionEngine],
  );

  const setLoopPoints = useCallback(
    (start: number, end: number) => {
      compositionEngine.setLoopPoints(start, end);
    },
    [compositionEngine],
  );

  const setTransportDuration = useCallback(
    (duration: number) => {
      compositionEngine.setTransportDuration(duration);
    },
    [compositionEngine],
  );

  return {
    isPlaying,
    tempo,
    timeSignature,
    tapTimes,
    loop,
    duration,
    position,
    play,
    pause,
    stop,
    seekTo,
    setTempo,
    setTimeSignature,
    startTapTempo,
    endTapTempo,
    setLoop,
    setLoopPoints,
    setTransportDuration,
    transportState,
  };
};
