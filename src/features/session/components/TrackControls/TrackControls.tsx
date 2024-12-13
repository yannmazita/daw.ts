// src/features/session/components/TrackControls/TrackControls.tsx
import { PlaylistTrack } from "@/core/interfaces/playlist";
import { VolumeControl } from "./VolumeControl";
import { PanControl } from "./PanControl";
import { MuteAndSolo } from "./MuteAndSolo";

interface TrackControlsProps {
  track: PlaylistTrack;
}

export const TrackControls: React.FC<TrackControlsProps> = ({ track }) => {
  return (
    <div className="flex flex-col gap-1 p-2">
      <VolumeControl trackId={track.id} volume={track.volume} />
      <PanControl trackId={track.id} pan={track.pan} />
      <MuteAndSolo trackId={track.id} mute={track.mute} solo={track.solo} />
    </div>
  );
};
