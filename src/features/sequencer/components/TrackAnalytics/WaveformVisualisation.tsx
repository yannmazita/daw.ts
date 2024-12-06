// src/features/sequencer/components/SequencerVisualisation/WaveformVisualisation.tsx

import React, { useEffect, useRef } from "react";
import * as Tone from "tone";
import { audioGraphManager } from "@/features/mixer/services/audioGraphManagerInstance";

interface WaveformVisualisationProps {
  trackId: string;
  width?: number;
  height?: number;
}

const WaveformVisualisation: React.FC<WaveformVisualisationProps> = ({
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
      type: "waveform",
      size: 1024,
    });

    const channel = audioGraphManager.getChannel(trackId);
    if (!channel) return;

    // Connect channel to analyzer
    channel.connect(analyser);

    const draw = () => {
      const waveform = analyser.getValue() as Float32Array;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Set up styling
      ctx.beginPath();
      ctx.strokeStyle = "#2563eb";
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
        Track Waveform
      </div>
    </div>
  );
};

export default WaveformVisualisation;
