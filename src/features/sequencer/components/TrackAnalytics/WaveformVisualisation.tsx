// src/features/sequencer/components/SequencerVisualisation/WaveformVisualisation.tsx

import React, { useEffect, useRef, useState } from "react";
import * as Tone from "tone";
import { useSequencerStore } from "../../slices/useSequencerStore";
import { instrumentManager } from "@/common/services/instrumentManagerInstance";

interface WaveformVisualisationProps {
  trackIndex: number;
  width?: number;
  height?: number;
}

const WaveformVisualisation: React.FC<WaveformVisualisationProps> = ({
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
      type: "waveform",
      size: 1024,
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

  const drawWaveform = () => {
    if (!canvasRef.current || !analyzerRef.current || !isAnalyzing) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const waveform = analyzerRef.current.getValue() as Float32Array;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set up styling
    ctx.beginPath();
    ctx.strokeStyle = "#2563eb"; // Blue color
    ctx.lineWidth = 2;

    // Draw waveform
    const sliceWidth = width / waveform.length;
    let x = 0;

    ctx.moveTo(0, height / 2);

    for (let i = 0; i < waveform.length; i++) {
      const y = ((waveform[i] + 1) * height) / 2;

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Request next frame
    animationFrameRef.current = requestAnimationFrame(drawWaveform);
  };

  useEffect(() => {
    if (isAnalyzing) {
      drawWaveform();
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
        Track {trackIndex + 1} Waveform
      </div>
    </div>
  );
};

export default WaveformVisualisation;
