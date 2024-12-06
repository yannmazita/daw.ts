// src/features/sequencer/components/SequencerVisualisation/SpectrumAnalyzer.tsx

import React, { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioGraphManager } from "@/features/mixer/services/audioGraphManagerInstance";

interface SpectrumAnalyzerProps {
  trackId: string;
  width?: number;
  height?: number;
}

const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  trackId,
  width = 600,
  height = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const analyser = new Tone.Analyser({
      type: "fft",
      size: 64,
      smoothing: 0.8,
    });

    const channel = audioGraphManager.getChannel(trackId);
    if (!channel) return;

    // Connect channel to analyzer
    channel.connect(analyser);

    const draw = () => {
      const spectrum = analyser.getValue() as Float32Array;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Draw frequency bars
      const barWidth = width / spectrum.length;
      const barSpacing = 2;
      const maxDb = -20;
      const minDb = -100;

      ctx.fillStyle = "#2563eb";

      spectrum.forEach((value, i) => {
        const dbValue = Math.max(minDb, Math.min(maxDb, value));
        const normalized = (dbValue - minDb) / (maxDb - minDb);
        const barHeight = normalized * height;

        ctx.fillRect(
          i * (barWidth + barSpacing),
          height - barHeight,
          barWidth,
          barHeight,
        );
      });

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      channel.disconnect(analyser);
      analyser.dispose();
    };
  }, [trackId, width, height]);

  return (
    <div className="relative bg-slate-100 rounded-md p-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-slate-200 rounded"
      />
      <div className="absolute top-2 left-2 text-xs text-slate-500">
        Frequency Spectrum
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
