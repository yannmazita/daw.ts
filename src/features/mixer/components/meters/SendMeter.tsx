// src/features/mixer/components/meters/SendMeter.tsx

import React, { useEffect, useRef } from "react";
import { cn } from "@/common/shadcn/lib/utils";
import { audioGraphManager } from "../../services/audioGraphManagerInstance";

interface Props {
  sendId: string;
  className?: string;
}

const SendMeter: React.FC<Props> = ({ sendId, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const meter = audioGraphManager.getSendMeter(sendId);
    if (!meter) return;

    const draw = () => {
      const value = meter.getValue();
      const normalizedValue = Math.max(
        0,
        Math.min(1, ((value as number) + 70) / 76),
      );

      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const height = canvas.height * normalizedValue;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "#22c55e");
      gradient.addColorStop(0.7, "#eab308");
      gradient.addColorStop(0.9, "#ef4444");

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
  }, [sendId]);

  return (
    <canvas
      ref={canvasRef}
      className={cn("bg-slate-800 rounded", className)}
      width={8}
      height={100}
    />
  );
};

export default SendMeter;
