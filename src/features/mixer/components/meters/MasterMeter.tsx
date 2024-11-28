// src/features/mixer/components/meters/MasterMeter.tsx

import React, { useEffect, useRef } from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { audioGraphManager } from "../../services/audioGraphManagerInstance";

interface Props {
  className?: string;
}

const MasterMeter: React.FC<Props> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const meter = audioGraphManager.getMeter("master");
    if (!meter) return;

    const draw = () => {
      const value = meter.getValue();
      const normalizedValue = Math.max(
        0,
        Math.min(1, ((value as number) + 70) / 76),
      ); // Normalize -70dB to 6dB

      // Clear canvas
      ctx.fillStyle = "#1e293b"; // slate-800
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw meter
      const height = canvas.height * normalizedValue;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "#22c55e"); // green-500
      gradient.addColorStop(0.7, "#eab308"); // yellow-500
      gradient.addColorStop(0.9, "#ef4444"); // red-500

      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - height, canvas.width, height);

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn("bg-slate-800 rounded", className)}
      width={20}
      height={200}
    />
  );
};

export default MasterMeter;
