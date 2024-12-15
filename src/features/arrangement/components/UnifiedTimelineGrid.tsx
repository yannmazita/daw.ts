// src/features/arrangement/components/UnifiedTimelineGrid.tsx
import { useEffect, useRef } from "react";
import { GRID_CONSTANTS } from "../utils/constants";
import { useStore } from "@/common/slices/useStore";
import { useThemeStore } from "@/common/slices/useThemeStore";

interface UnifiedTimelineGridProps {
  zoom: number;
  scrollPosition: { x: number; y: number };
}

// Utility function to convert CSS HSL variable to canvas color
const getCSSColor = (variable: string, opacity = 1): string => {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(variable)
    .trim();

  if (!value) return "";

  // Parse the HSL values
  const [hue, saturation, lightness] = value
    .split(" ")
    .map((v) => parseFloat(v));

  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity})`;
};

export const UnifiedTimelineGrid = ({
  zoom,
  scrollPosition,
}: UnifiedTimelineGridProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { timeSignature } = useStore();
  const theme = useThemeStore((state) => state.theme);
  const [beatsPerBar] = timeSignature;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = canvas.parentElement;
    if (!container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(pixelRatio, pixelRatio);

    // Clear canvas with theme background
    ctx.fillStyle = getCSSColor("--background");
    ctx.fillRect(0, 0, width, height);

    const pixelsPerBeat = zoom;
    const pixelsPerBar = pixelsPerBeat * beatsPerBar;
    const startBar = Math.floor(scrollPosition.x / pixelsPerBar);
    const endBar = Math.ceil((scrollPosition.x + width) / pixelsPerBar);

    // Draw ruler area
    ctx.fillStyle = getCSSColor("--accent");
    ctx.fillRect(0, 0, width, GRID_CONSTANTS.RULER_HEIGHT);

    // Draw grid lines
    for (let bar = startBar; bar <= endBar; bar++) {
      const barX = Math.round(bar * pixelsPerBar - scrollPosition.x);

      // Bar numbers
      if (bar >= 0) {
        ctx.font = "10px Inter, system-ui, sans-serif";
        ctx.fillStyle = getCSSColor("--accent-foreground");
        ctx.textAlign = "center";
        ctx.fillText(bar.toString(), barX + 2, GRID_CONSTANTS.RULER_HEIGHT / 2);
      }

      // Bar lines
      ctx.beginPath();
      ctx.strokeStyle = getCSSColor("--foreground", bar % 4 === 0 ? 0.8 : 0.4);
      ctx.lineWidth = bar % 4 === 0 ? 1 : 0.5;
      ctx.moveTo(barX, 0);
      ctx.lineTo(barX, height);
      ctx.stroke();

      // Beat lines
      for (let beat = 1; beat < beatsPerBar; beat++) {
        const beatX = Math.round(barX + beat * pixelsPerBeat);
        ctx.beginPath();
        ctx.strokeStyle = getCSSColor("--foreground", 0.4);
        ctx.lineWidth = 0.5;
        ctx.moveTo(beatX, GRID_CONSTANTS.RULER_HEIGHT);
        ctx.lineTo(beatX, height);
        ctx.stroke();
      }
    }

    // Ruler border
    ctx.beginPath();
    ctx.strokeStyle = getCSSColor("--border", 0.8);
    ctx.lineWidth = 1;
    ctx.moveTo(0, GRID_CONSTANTS.RULER_HEIGHT);
    ctx.lineTo(width, GRID_CONSTANTS.RULER_HEIGHT);
    ctx.stroke();

    // Track lines
    const trackCount = Math.ceil(
      (height - GRID_CONSTANTS.RULER_HEIGHT) / GRID_CONSTANTS.TRACK_HEIGHT,
    );
    for (let i = 0; i <= trackCount; i++) {
      const y = GRID_CONSTANTS.RULER_HEIGHT + i * GRID_CONSTANTS.TRACK_HEIGHT;
      ctx.beginPath();
      ctx.strokeStyle = getCSSColor("--foreground", 0.4);
      ctx.lineWidth = 0.5;
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
  }, [zoom, scrollPosition.x, beatsPerBar, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ backgroundColor: "transparent" }}
    />
  );
};
