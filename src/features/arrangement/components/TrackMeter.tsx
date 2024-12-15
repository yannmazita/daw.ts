// src/features/arrangement/components/TrackMeter.tsx
import { useEffect, useRef } from "react";
import { useStore } from "@/common/slices/useStore";

interface TrackMeterProps {
  trackId: string;
}

export const TrackMeter: React.FC<TrackMeterProps> = ({ trackId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { getMeterData } = useStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      const meterData = getMeterData(trackId);
      if (!meterData) return;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw meter background
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Convert dB to height percentage
      const dbToHeight = (db: number) => {
        const minDb = -70;
        const maxDb = 0;
        return Math.max(0, Math.min(1, (db - minDb) / (maxDb - minDb)));
      };

      // Draw meter level
      const height = dbToHeight(meterData.values as number) * canvas.height;
      const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
      gradient.addColorStop(0, "hsl(var(--primary))");
      gradient.addColorStop(0.8, "hsl(var(--primary))");
      gradient.addColorStop(1, "hsl(var(--destructive))");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, canvas.height - height, canvas.width, height);

      requestAnimationFrame(animate);
    };

    const animation = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animation);
  }, [trackId, getMeterData]);

  return <canvas ref={canvasRef} className="h-4 w-2" width={4} height={32} />;
};
