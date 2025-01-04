// src/features/mix/components/MixerControls/Meter.tsx
import { useEffect, useRef } from "react";

interface MeterProps {
  getMeterValues: () => number | number[] | null;
}

export const Meter: React.FC<MeterProps> = ({ getMeterValues }) => {
  const meterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let animationFrameId: number;
    const updateMeter = () => {
      if (meterRef.current) {
        const level = getMeterValues();
        if (typeof level === "number") {
          const scaledLevel = Math.max(0, Math.min(1, (level + 60) / 60)); // Scale from -60 to 0 db to 0-1
          meterRef.current.style.width = `${scaledLevel * 100}%`;
        } else if (Array.isArray(level)) {
          const scaledLevel = Math.max(0, Math.min(1, (level[0] + 60) / 60)); // Handle stereo levels if needed
          meterRef.current.style.width = `${scaledLevel * 100}%`;
        }
      }
      animationFrameId = requestAnimationFrame(updateMeter);
    };

    updateMeter();
    return () => cancelAnimationFrame(animationFrameId);
  }, [getMeterValues]);

  return (
    <div className="relative overflow-hidden bg-red-600">
      <div
        ref={meterRef}
        className="transition-width absolute left-0 top-0 h-full bg-blue-700 duration-100"
        style={{ width: "0%" }}
      ></div>
    </div>
  );
};
