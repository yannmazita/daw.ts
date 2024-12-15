// src/features/arrangement/hooks/useTimelineZoom.ts
import { useState, useCallback, useEffect } from "react";
import { GRID_CONSTANTS } from "../utils/constants";

interface ZoomState {
  zoom: number;
  zoomToPoint: (delta: number, point: { x: number; scrollX: number }) => void;
  setZoom: (zoom: number) => void;
}

export const useTimelineZoom = (
  containerRef: React.RefObject<HTMLDivElement>,
  onScroll?: (scrollLeft: number) => void,
): ZoomState => {
  const [zoom, setZoomInternal] = useState(GRID_CONSTANTS.DEFAULT_ZOOM);

  const zoomToPoint = useCallback(
    (delta: number, point: { x: number; scrollX: number }) => {
      if (!containerRef.current) return;

      // Calculate zoom with easing
      const ease = (x: number) =>
        x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2;
      const zoomFactor = ease(Math.abs(delta)) * Math.sign(delta) * 0.2;
      const newZoom = Math.min(
        Math.max(zoom * (1 + zoomFactor), GRID_CONSTANTS.MIN_ZOOM),
        GRID_CONSTANTS.MAX_ZOOM,
      );

      // Calculate the point position relative to content
      const pointPosition = point.x + point.scrollX;

      // Calculate new scroll position to keep the zoom point stationary
      const scale = newZoom / zoom;
      const newScrollLeft = pointPosition * scale - point.x;

      // Update zoom and scroll position
      setZoomInternal(newZoom);
      if (onScroll) {
        onScroll(newScrollLeft);
      } else {
        containerRef.current.scrollLeft = newScrollLeft;
      }
    },
    [zoom, containerRef, onScroll],
  );

  const setZoom = useCallback((newZoom: number) => {
    setZoomInternal(
      Math.min(
        Math.max(newZoom, GRID_CONSTANTS.MIN_ZOOM),
        GRID_CONSTANTS.MAX_ZOOM,
      ),
    );
  }, []);

  // Prevent browser zoom on Ctrl+Wheel
  useEffect(() => {
    const preventBrowserZoom = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "0") {
        e.preventDefault();
      }
    };

    window.addEventListener("keydown", preventBrowserZoom);
    return () => window.removeEventListener("keydown", preventBrowserZoom);
  }, []);

  return { zoom, zoomToPoint, setZoom };
};
