// src/features/arrangement/components/TrackHeader.tsx
import { useState, useCallback, useEffect } from "react";
import { Input } from "@/common/shadcn/ui/input";
import { useTrackOperations } from "../../hooks/useTrackOperations";
import { useLayoutStore } from "@/core/stores/useLayoutStore";
import { useTrackState } from "../../hooks/useTrackState";
import { TrackIcon } from "./TrackIcon";
import { TrackHeaderControls } from "./TrackHeaderControls";
import { DraggableTrackHeader } from "../DraggableTrackHeader";
import { TrackDropdownMenu } from "./TrackDropdownMenu";
import { cn } from "@/common/shadcn/lib/utils";
import { Track } from "../../types";

interface TrackHeaderProps {
  trackId: string;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ trackId }) => {
  const trackState = useTrackState(trackId);
  if (!trackState) return null;

  const { renameTrack } = useTrackOperations();
  const { initializeTrackLayout } = useLayoutStore();
  const height =
    useLayoutStore((state) => state.trackLayouts[trackId]?.height) ?? 0;

  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(trackState.name);

  const handleNameSubmit = useCallback(() => {
    if (tempName.trim() && tempName !== trackState.name) {
      renameTrack(trackId, tempName);
    }
    setIsEditing(false);
  }, [tempName, trackState.name, trackId, renameTrack]);

  useEffect(() => {
    initializeTrackLayout(trackId);
  }, [trackId, initializeTrackLayout]);

  const Content = (
    <div
      className={cn(
        "flex h-full flex-col border-b border-border px-2 py-1",
        "select-none",
        trackState.type === "mixer" && "bg-accent/5",
        trackState.isMaster && "bg-accent/10",
      )}
      style={{ height }}
    >
      <div className="flex items-center space-x-2">
        <TrackIcon trackState={trackState} />
        {isEditing ? (
          <Input
            value={tempName}
            onChange={(e) => setTempName(e.target.value)}
            onBlur={handleNameSubmit}
            onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
            className="h-6 w-32"
            autoFocus
          />
        ) : (
          <span
            className={cn(
              "cursor-pointer text-sm font-medium hover:text-primary",
              trackState.isMaster && "font-bold text-primary",
            )}
            onClick={() => !trackState.isMaster && setIsEditing(true)}
          >
            {trackState.name}
          </span>
        )}
        {!trackState.isMaster && (
          <TrackDropdownMenu
            trackId={trackId}
            setIsEditing={setIsEditing}
            isArrangement={trackState.type === "arrangement"}
          />
        )}
      </div>
      <TrackHeaderControls trackId={trackId} />
    </div>
  );

  return trackState.type === "arrangement" ? (
    <DraggableTrackHeader
      track={trackState.track as Track}
      index={trackState.index}
    >
      {Content}
    </DraggableTrackHeader>
  ) : (
    Content
  );
};
