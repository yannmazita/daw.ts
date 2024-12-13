// src/features/session/components/SessionGrid/TrackList/TrackHeader.tsx
import { PlaylistTrack } from "@/core/interfaces/playlist";

interface TrackHeaderProps {
  track: PlaylistTrack;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({ track }) => {
  return (
    <div className="flex h-12 flex-col justify-center border-b border-border bg-muted p-2">
      <div className="truncate text-sm font-medium">{track.name}</div>
    </div>
  );
};
