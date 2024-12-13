// src/features/session/components/SessionGrid/TrackList/TrackList.tsx
import { PlaylistTrack } from "@/core/interfaces/playlist";
import { TrackColumn } from "./TrackColumn";

interface TrackListProps {
  tracks: PlaylistTrack[];
}

export const TrackList: React.FC<TrackListProps> = ({ tracks }) => {
  return (
    <div className="flex">
      {tracks.map((track) => (
        <TrackColumn key={track.id} track={track} />
      ))}
    </div>
  );
};
