// src/features/arrangement/components/UnifiedTimelineGrid.tsx
import { useEffect, useMemo, useRef } from "react";
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

  // Memoize colors to prevent recalculation
  const colors = useMemo(
    () => ({
      background: getCSSColor("--background"),
      rulerBg: getCSSColor("--accent"),
      text: getCSSColor("--accent-foreground"),
      border: getCSSColor("--border"),
      gridLines: {
        major: getCSSColor(
          "--foreground",
          GRID_CONSTANTS.SUBDIVISION_LEVELS.MAJOR_BAR.opacity,
        ),
        bar: getCSSColor(
          "--foreground",
          GRID_CONSTANTS.SUBDIVISION_LEVELS.BAR.opacity,
        ),
        beat: getCSSColor(
          "--foreground",
          GRID_CONSTANTS.SUBDIVISION_LEVELS.BEAT.opacity,
        ),
        subdivision: getCSSColor(
          "--foreground",
          GRID_CONSTANTS.SUBDIVISION_LEVELS.SUBDIVISION.opacity,
        ),
      },
    }),
    [theme],
  );

  const drawGridLine = (
    ctx: CanvasRenderingContext2D,
    x: number,
    height: number,
    style: { opacity: number; width: number },
    startY = 0,
  ) => {
    ctx.beginPath();
    ctx.strokeStyle = getCSSColor("--foreground", style.opacity);
    ctx.lineWidth = style.width;
    const adjustedX = Math.floor(x) + 0.5; // Align to pixel grid
    ctx.moveTo(adjustedX, startY);
    ctx.lineTo(adjustedX, height);
    ctx.stroke();
  };

  const drawRulerTick = (
    ctx: CanvasRenderingContext2D,
    x: number,
    height: number,
    label?: string,
  ) => {
    ctx.beginPath();
    ctx.moveTo(x, GRID_CONSTANTS.RULER_HEIGHT);
    ctx.lineTo(x, GRID_CONSTANTS.RULER_HEIGHT - height);
    ctx.stroke();

    if (label) {
      ctx.fillStyle = colors.text;
      ctx.font = `${GRID_CONSTANTS.RULER.FONT_SIZE}px ${GRID_CONSTANTS.RULER.FONT_FAMILY}`;
      ctx.textAlign = "center";
      ctx.fillText(
        label,
        x,
        GRID_CONSTANTS.RULER_HEIGHT -
          GRID_CONSTANTS.RULER.MAJOR_TICK_HEIGHT -
          2,
      );
    }
  };

  const drawTrackLines = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scrollY: number,
  ) => {
    const startTrack = Math.floor(scrollY / GRID_CONSTANTS.TRACK_HEIGHT);
    const endTrack = Math.ceil(
      (scrollY + height - GRID_CONSTANTS.RULER_HEIGHT) /
        GRID_CONSTANTS.TRACK_HEIGHT,
    );

    ctx.beginPath();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;

    // Draw track separator lines
    for (let i = startTrack; i <= endTrack; i++) {
      const y =
        Math.floor(
          GRID_CONSTANTS.RULER_HEIGHT +
            i * GRID_CONSTANTS.TRACK_HEIGHT -
            scrollY,
        ) + 0.5; // Add 0.5 for crisp lines

      // Draw main track separator
      ctx.beginPath();
      ctx.strokeStyle = getCSSColor("--foreground");
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();

      /*
      const middleY = y + GRID_CONSTANTS.TRACK_HEIGHT / 2;
      if (middleY < height) {
        ctx.beginPath();
        ctx.strokeStyle = getCSSColor("--primary", 0.2);
        ctx.moveTo(0, middleY);
        ctx.lineTo(width, middleY);
        ctx.stroke();
      }
      */
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    // Setup canvas
    const container = canvas.parentElement!;
    const pixelRatio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = width * pixelRatio;
    canvas.height = height * pixelRatio;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(pixelRatio, pixelRatio);

    // Clear canvas
    ctx.fillStyle = colors.background;
    ctx.fillRect(0, 0, width, height);

    // Draw ruler background
    ctx.fillStyle = colors.rulerBg;
    ctx.fillRect(0, 0, width, GRID_CONSTANTS.RULER_HEIGHT);

    // Calculate grid dimensions
    const pixelsPerBeat = zoom;
    const pixelsPerBar = pixelsPerBeat * beatsPerBar;
    const startBar = Math.floor(scrollPosition.x / pixelsPerBar);
    const endBar = Math.ceil((scrollPosition.x + width) / pixelsPerBar);
    const subdivisions = GRID_CONSTANTS.BEAT_SUBDIVISIONS;

    // Draw grid lines and ruler
    for (let bar = startBar; bar <= endBar; bar++) {
      const barX = Math.round(bar * pixelsPerBar - scrollPosition.x);
      const isMajorBar = bar % GRID_CONSTANTS.MAJOR_BAR_INTERVAL === 0;

      // Draw bar line
      drawGridLine(
        ctx,
        barX,
        height,
        isMajorBar
          ? GRID_CONSTANTS.SUBDIVISION_LEVELS.MAJOR_BAR
          : GRID_CONSTANTS.SUBDIVISION_LEVELS.BAR,
      );

      // Draw bar number in ruler
      if (bar >= 0) {
        drawRulerTick(
          ctx,
          barX,
          isMajorBar
            ? GRID_CONSTANTS.RULER.MAJOR_TICK_HEIGHT
            : GRID_CONSTANTS.RULER.BEAT_TICK_HEIGHT,
          isMajorBar ? bar.toString() : undefined,
        );
      }

      // Draw beats and subdivisions
      for (let beat = 0; beat < beatsPerBar; beat++) {
        const beatX = barX + beat * pixelsPerBeat;

        // Draw beat lines
        if (beat > 0) {
          drawGridLine(
            ctx,
            beatX,
            height,
            GRID_CONSTANTS.SUBDIVISION_LEVELS.BEAT,
            GRID_CONSTANTS.RULER_HEIGHT,
          );
          drawRulerTick(ctx, beatX, GRID_CONSTANTS.RULER.BEAT_TICK_HEIGHT);
        }

        // Draw subdivisions
        if (zoom > GRID_CONSTANTS.MIN_ZOOM * 1.5) {
          for (let sub = 1; sub < subdivisions; sub++) {
            const subX = beatX + (sub * pixelsPerBeat) / subdivisions;
            drawGridLine(
              ctx,
              subX,
              height,
              GRID_CONSTANTS.SUBDIVISION_LEVELS.SUBDIVISION,
              GRID_CONSTANTS.RULER_HEIGHT,
            );
            drawRulerTick(
              ctx,
              subX,
              GRID_CONSTANTS.RULER.SUBDIVISION_TICK_HEIGHT,
            );
          }
        }
      }
    }

    // Draw horizontal track lines
    drawTrackLines(ctx, width, height, scrollPosition.y);

    // Draw ruler border
    ctx.beginPath();
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.moveTo(0, GRID_CONSTANTS.RULER_HEIGHT + 0.5);
    ctx.lineTo(width, GRID_CONSTANTS.RULER_HEIGHT + 0.5);
    ctx.stroke();
  }, [zoom, scrollPosition.x, scrollPosition.y, beatsPerBar, colors]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
      style={{ backgroundColor: "transparent" }}
    />
  );
};
