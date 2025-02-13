// src/features/mix/components/Mixer/Mixer.tsx
import { useTrackOperations } from "@/features/mix/hooks/useTrackOperations";
import { useReturnTrackOperations } from "../../hooks/useReturnTrackOperations";
import { TrackControls } from "./MixerUnits/TrackControls";
import { ReturnTrackControls } from "./MixerUnits/ReturnTrackControls";
import { SoundChainControls } from "./MixerUnits/SoundChainControls";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";
import { MixerBar } from "../MixerBar";
import { MasterTrackControls } from "./MixerUnits/MasterTrackControls";
import { useSelection } from "@/common/hooks/useSelection";

export const Mixer: React.FC = () => {
  const { tracksOrder } = useTrackOperations();
  const { returnTracksOrder } = useReturnTrackOperations();
  const { handleClickedTrack } = useSelection();

  return (
    <>
      <MixerBar />
      <div className="row-span-1 grid h-80 grid-cols-[1fr_auto] border border-border">
        <ScrollArea className="h-full [&>div>div]:h-full [&>div]:h-full **:data-radix-scroll-area-viewport:h-full">
          <div className="flex h-full flex-row">
            {/* Regular tracks */}
            {tracksOrder.map((trackId, index) => (
              <TrackControls
                key={trackId}
                trackId={trackId}
                className={cn(index === 0 && "ml-1")}
                onClick={() => handleClickedTrack(trackId)}
              />
            ))}
            {/* Return tracks */}
            {returnTracksOrder.map((trackId) => (
              <ReturnTrackControls
                key={trackId}
                trackId={trackId}
                onClick={() => handleClickedTrack(trackId)}
              />
            ))}
            {/* Sound Chains */}
            {tracksOrder.map((trackId) => (
              <SoundChainControls key={trackId} trackId={trackId} />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {/* Master Track - fixed position */}
        <MasterTrackControls
          className="border-l"
          onClick={() => handleClickedTrack("master")}
        />
      </div>
    </>
  );
};
