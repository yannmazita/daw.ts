// src/features/arrangement/hooks/useZoomGestures.ts
import { useEffect, useRef } from "react";

interface ZoomGesturesOptions {
  onZoom: (delta: number, point: { x: number; scrollX: number }) => void;
  scrollPosition: { x: number };
}

export const useZoomGestures = (
  containerRef: React.RefObject<HTMLDivElement>,
  { onZoom, scrollPosition }: ZoomGesturesOptions,
) => {
  const gestureRef = useRef({
    isZooming: false,
    lastScale: 1,
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      // Check for zoom gesture
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        onZoom(e.deltaY * -0.01, { x, scrollX: scrollPosition.x });
      }
    };

    // Handle gesture events for trackpad pinch
    const handleGestureStart = (e: any) => {
      e.preventDefault();
      gestureRef.current.isZooming = true;
      gestureRef.current.lastScale = 1;
    };

    const handleGestureChange = (e: any) => {
      if (!gestureRef.current.isZooming) return;
      e.preventDefault();

      const delta = (e.scale / gestureRef.current.lastScale - 1) * 2;
      gestureRef.current.lastScale = e.scale;

      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      onZoom(delta, { x, scrollX: scrollPosition.x });
    };

    const handleGestureEnd = (e: any) => {
      e.preventDefault();
      gestureRef.current.isZooming = false;
    };

    // Prevent browser zoom shortcuts
    const preventBrowserZoom = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "=" || e.key === "-" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    // Add event listeners
    container.addEventListener("wheel", handleWheel, { passive: false });
    container.addEventListener("gesturestart", handleGestureStart, {
      passive: false,
    });
    container.addEventListener("gesturechange", handleGestureChange, {
      passive: false,
    });
    container.addEventListener("gestureend", handleGestureEnd, {
      passive: false,
    });
    window.addEventListener("keydown", preventBrowserZoom);

    // Cleanup
    return () => {
      container.removeEventListener("wheel", handleWheel);
      container.removeEventListener("gesturestart", handleGestureStart);
      container.removeEventListener("gesturechange", handleGestureChange);
      container.removeEventListener("gestureend", handleGestureEnd);
      window.removeEventListener("keydown", preventBrowserZoom);
    };
  }, [containerRef, onZoom, scrollPosition]);
};
