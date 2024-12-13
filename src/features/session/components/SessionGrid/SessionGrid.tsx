// src/features/session/components/SessionGrid/SessionGrid.tsx
import { useStore } from "@/common/slices/useStore";
import { SceneList } from "./SceneList/SceneList";
import { TrackList } from "./TrackList/TrackList";

export const SessionGrid: React.FC = () => {
  const scenes = useStore((state) => state.scenes);
  const tracks = useStore((state) => state.tracks);

  return (
    <div className="relative flex h-full overflow-hidden rounded-lg border border-border bg-background">
      {/* Scene Launch Column */}
      <div className="flex w-24 flex-none flex-col border-r border-border">
        <div className="h-12 border-b border-border bg-muted" />{" "}
        {/* Header space */}
        <SceneList scenes={scenes} />
      </div>

      {/* Tracks Grid */}
      <div className="flex-1 overflow-auto">
        <TrackList tracks={tracks} />
      </div>
    </div>
  );
};
