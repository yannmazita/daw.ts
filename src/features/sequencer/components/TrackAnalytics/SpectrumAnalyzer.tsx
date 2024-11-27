// src/features/sequencer/components/SequencerVisualisation/SpectrumAnalyzer.tsx

import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";

interface SpectrumAnalyzerProps {
  trackIndex: number;
  width?: number;
  height?: number;
}

const SpectrumAnalyzer: React.FC<SpectrumAnalyzerProps> = ({
  trackIndex,
  width = 600,
  height = 100,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const analyzerRef = useRef<Tone.Analyser | null>(null);
  const animationFrameRef = useRef<number>();
  const trackInfo = useSequencerStore((state) => state.trackInfo[trackIndex]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (!trackInfo?.instrumentId) return;

    const instrument = instrumentManager.getInstrument(trackInfo.instrumentId);
    if (!instrument) return;

    // Create analyzer node
    analyzerRef.current = new Tone.Analyser({
      type: "fft",
      size: 64,
      smoothing: 0.8,
    });

    // Connect instrument to analyzer
    instrument.connect(analyzerRef.current);

    setIsAnalyzing(true);

    return () => {
      if (analyzerRef.current) {
        instrument.disconnect(analyzerRef.current);
        analyzerRef.current.dispose();
      }
    };
  }, [trackInfo?.instrumentId]);

  const drawSpectrum = () => {
    if (!canvasRef.current || !analyzerRef.current || !isAnalyzing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const spectrum = analyzerRef.current.getValue() as Float32Array;

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

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(drawSpectrum);
  };

  useEffect(() => {
    if (isAnalyzing) {
      drawSpectrum();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isAnalyzing]);

  return (
    <div className="relative bg-slate-100 rounded-md p-2">
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-slate-200 rounded"
      />
      <div className="absolute top-2 left-2 text-xs text-slate-500">
        Track {trackIndex + 1} Spectrum
      </div>
    </div>
  );
};

export default SpectrumAnalyzer;
