// src/features/session/components/SessionGrid/SessionGrid.tsx
import { useStore } from "@/common/slices/useStore";
import { SceneList } from "./SceneList/SceneList";
import { TrackList } from "./TrackList/TrackList";
import { CreateTrack } from "./TrackList/CreateTrack";
import { CreateScene } from "./SceneList/CreateScene";
import { cn } from "@/common/shadcn/lib/utils";

export const SessionGrid: React.FC = () => {
  const scenes = useStore((state) => state.scenes);
  const tracks = useStore((state) => state.tracks);

  return (
    <div className="relative flex h-full overflow-hidden border-b border-border bg-background dark:border-b dark:border-border">
      {/* Scene Launch Column */}
      <div className="flex w-fit flex-none flex-col border-r border-border">
        <div className="flex flex-col">
          <SceneList scenes={scenes} />
          <div className="flex items-center justify-center p-2">
            <CreateScene />
          </div>
        </div>
      </div>

      {/* Tracks Grid */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">
          <TrackList tracks={tracks} />
          <div
            className={cn(
              "flex w-32 items-center justify-center border-r border-border p-2",
              {
                "border-b": tracks.length !== 0 || scenes.length !== 0,
              },
            )}
          >
            <CreateTrack />
          </div>
        </div>
      </div>
    </div>
  );
};
