// src/common/components/Knob/Knob.tsx

import { useState, useRef, useCallback, useEffect } from "react";
import { KnobIndicator } from "./KnobIndicator";
import { cn } from "@/common/shadcn/lib/utils";

interface KnobProps {
  min?: number;
  max?: number;
  step?: number;
  value?: number;
  onChange: (value: number) => void;
  radius?: number;
  ariaLabel?: string;
  sensitivity?: {
    mouse?: number;
    wheel?: number;
    auto?: boolean;
  };
  rotationRange?: number;
  startAngle?: number;
  className?: string;
}

export const Knob: React.FC<KnobProps> = ({
  min = 0,
  max = 100,
  step = 1,
  value = 0,
  onChange,
  radius = 50,
  ariaLabel = "Knob",
  sensitivity = { auto: true },
  rotationRange = 300, // default 300 degrees of rotation
  startAngle = -240,
  className,
}) => {
  const [currentValue, setCurrentValue] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const prevY = useRef<number | null>(null);

  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Calculate auto-scaling sensitivity
  const calculateAutoSensitivity = useCallback(() => {
    if (!sensitivity.auto) {
      return {
        mouse: sensitivity.mouse ?? 1,
        wheel: sensitivity.wheel ?? 0.015,
      };
    }

    const BASE_RANGE = 100;
    const BASE_STEP = 1;
    const BASE_MOUSE_SENSITIVITY = 1;
    const BASE_WHEEL_SENSITIVITY = 0.005;
    const MIN_SCALE_FACTOR = 0.15;

    const valueRange = max - min;

    // Non-linear scaling
    let rangeScaleFactor;
    if (valueRange > BASE_RANGE) {
      // Cube root scaling for large ranges
      rangeScaleFactor = BASE_RANGE / Math.pow(valueRange * BASE_RANGE, 1 / 3);
    } else {
      // Square scaling for small ranges
      rangeScaleFactor = Math.sqrt(BASE_RANGE / valueRange);
    }

    // Linear step scaling
    const stepScaleFactor = step / BASE_STEP;

    // Combine the factors with minimum threshold
    const scaleFactor = Math.max(
      rangeScaleFactor * stepScaleFactor,
      MIN_SCALE_FACTOR,
    );

    return {
      mouse: BASE_MOUSE_SENSITIVITY * scaleFactor,
      wheel: BASE_WHEEL_SENSITIVITY * scaleFactor,
    };
  }, [min, max, step, sensitivity]);

  const effectiveSensitivity = calculateAutoSensitivity();

  const calculateValue = useCallback(
    (deltaY: number) => {
      let newValue = currentValue - deltaY;
      newValue = Math.min(max, Math.max(min, newValue));
      newValue = Math.round(newValue / step) * step;
      return newValue;
    },
    [currentValue, min, max, step],
  );

  const handleValueChange = (newValue: number) => {
    setCurrentValue(newValue);
    onChange(newValue);
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging) return;
      const clientY =
        e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;

      if (prevY.current === null) {
        prevY.current = clientY;
        return;
      }
      const deltaY = (clientY - prevY.current) * effectiveSensitivity.mouse;
      prevY.current = clientY;
      const newValue = calculateValue(deltaY);
      handleValueChange(newValue);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      prevY.current = null;
    };

    if (isDragging) {
      document.addEventListener("mousemove", handleMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleMove, { passive: false });
      document.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleMove);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging, calculateValue, sensitivity.mouse]);

  const handleStart = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    ) => {
      setIsDragging(true);
      prevY.current =
        e.type === "mousedown"
          ? (e as React.MouseEvent).clientY
          : (e as React.TouchEvent).touches[0].clientY;
    },
    [],
  );

  const handleWheel = useCallback(
    (e: React.WheelEvent<HTMLDivElement>) => {
      const deltaY = e.deltaY * effectiveSensitivity.wheel;
      const newValue = calculateValue(deltaY);
      handleValueChange(newValue);
    },
    [calculateValue, effectiveSensitivity.wheel],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newValue = Math.min(max, currentValue + step);
        handleValueChange(newValue);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newValue = Math.max(min, currentValue - step);
        handleValueChange(newValue);
      }
    },
    [currentValue, min, max, step],
  );

  const indicatorRotation =
    ((currentValue - min) / (max - min)) * rotationRange + startAngle;

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex items-center justify-center focus:outline-none",
        className,
      )}
      style={{ width: `${radius * 2}px`, height: `${radius * 2}px` }}
      onMouseDown={handleStart}
      onTouchStart={handleStart}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="slider"
      aria-label={ariaLabel}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuenow={currentValue}
    >
      <div
        className="absolute rounded-full border border-foreground dark:border-background"
        style={{
          width: `${radius * 2}px`,
          height: `${radius * 2}px`,
        }}
      ></div>
      <KnobIndicator radius={radius} rotation={indicatorRotation} />
    </div>
  );
};
