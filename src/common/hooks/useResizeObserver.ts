// src/common/hooks/useResizeObserver.ts
import { useLayoutEffect, useRef, useState } from "react";

interface UseResizeObserverResult<T extends HTMLElement> {
  ref: React.RefObject<T | null>;
  width: number;
  height: number;
}

const useResizeObserver = <
  T extends HTMLElement,
>(): UseResizeObserverResult<T> => {
  const ref = useRef<T | null>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  useLayoutEffect(() => {
    let resizeObserver: ResizeObserver | null = null;
    const element = ref.current;

    if (element) {
      // Set initial sizes
      setWidth(element.offsetWidth);
      setHeight(element.offsetHeight);

      resizeObserver = new ResizeObserver(([entry]) => {
        if (entry) {
          const { width, height } = entry.contentRect;
          setWidth(Math.round(width));
          setHeight(Math.round(height));
        }
      });
      resizeObserver.observe(element);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, []);

  return { ref, width, height };
};

export { useResizeObserver };
