// src/features/arrangement/components/TrackHeader/TrackIcon.tsx
import { Mic, Music2, Waves, ArrowDownToLine } from "lucide-react";
import { TrackState } from "../../hooks/useTrackState";

interface TrackIconProps {
  trackState: TrackState;
}

export const TrackIcon: React.FC<TrackIconProps> = ({ trackState }) => {
  if (trackState.isMixer) {
    if (trackState.isMaster) return <Waves className="h-4 w-4 text-primary" />;
    if (trackState.isReturn)
      return <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />;
  }

  return trackState.track.type === "audio" ? (
    <Mic className="h-4 w-4 text-muted-foreground" />
  ) : (
    <Music2 className="h-4 w-4 text-muted-foreground" />
  );
};
