// src/features/session/components/SessionGrid/TrackList/TrackColumn.tsx
import { PlaylistTrack } from "@/core/interfaces/playlist";
import { ClipSlot } from "../../ClipSlot/ClipSlot";
import { TrackHeader } from "./TrackHeader";
import { TrackControls } from "../../TrackControls/TrackControls";

interface TrackColumnProps {
  track: PlaylistTrack;
}

export const TrackColumn: React.FC<TrackColumnProps> = ({ track }) => {
  return (
    <div className="flex w-32 flex-none flex-col border-r border-border">
      <TrackHeader track={track} />
      <div className="flex flex-col">
        {Array.from({ length: 8 }).map((_, index) => (
          <ClipSlot key={index} trackId={track.id} index={index} />
        ))}
      </div>
      <TrackControls track={track} />
    </div>
  );
};
