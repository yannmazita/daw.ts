import React from "react";
import { cn } from "@/common/shadcn/lib/utils";

interface MeterProps {
  getMeterValues: () => number | number[];
  totalLeds?: number;
  greenRange?: [number, number];
  orangeRange?: [number, number];
  redRange?: [number, number];
  minValue?: number;
  maxValue?: number;
}

export const Meter: React.FC<MeterProps> = ({
  getMeterValues,
  totalLeds = 25,
  greenRange = [-60, -6],
  orangeRange = [-6, -0],
  redRange = [0, 6],
  minValue = -60,
  maxValue = 6,
}) => {
  const levels = getMeterValues();
  const value = Array.isArray(levels) ? levels[0] : levels; // todo: Handle multi-channel
  // Normalize the value to determine the number of LEDs lit
  const normalizedValue = Math.max(
    0,
    Math.min(
      totalLeds,
      ((value - minValue) / (maxValue - minValue)) * totalLeds,
    ),
  );

  const renderLed = (index: number) => {
    // Determine the color for the LED
    const ledValue = (index / totalLeds) * (maxValue - minValue) + minValue;

    let colorClass = "bg-gray-700"; // Default: off
    if (ledValue >= greenRange[0] && ledValue <= greenRange[1]) {
      colorClass = "bg-green-500";
    } else if (ledValue >= orangeRange[0] && ledValue <= orangeRange[1]) {
      colorClass = "bg-orange-500";
    } else if (ledValue >= redRange[0] && ledValue <= redRange[1]) {
      colorClass = "bg-red-500";
    }

    // Check if the LED should be LIT
    const isLit = index < normalizedValue;

    return (
      <div
        key={index}
        className={cn(
          "h-1 w-10 rounded-sm transition-opacity duration-150",
          colorClass,
          {
            "opacity-100": isLit,
            "opacity-30": !isLit,
          },
        )}
      ></div>
    );
  };

  return (
    <div className="flex flex-col items-center space-y-1">
      {Array.from({ length: totalLeds })
        .map((_, index) => totalLeds - 1 - index) // Reverse the order of the indexes
        .map((index) => renderLed(index))}
    </div>
  );
};
