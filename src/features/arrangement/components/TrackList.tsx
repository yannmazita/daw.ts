// src/features/arrangement/components/TrackList.tsx
import { GRID_CONSTANTS } from "../utils/constants";

export const TrackList = () => {
  return (
    <div className="flex flex-col">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center border-b border-border bg-card px-2"
          style={{ height: GRID_CONSTANTS.TRACK_HEIGHT }}
        >
          <span className="text-sm font-medium text-muted-foreground">
            Track {i + 1}
          </span>
        </div>
      ))}
    </div>
  );
};
