// src/features/mix/components/Mixer/Mixer.tsx
import { useTrackOperations } from "@/features/composition/hooks/useTrackOperations";
import { useMixerTrackOperations } from "../../hooks/useMixerTrackOperations";
import { CompositionTrackControls } from "./MixerUnits/CompositionTrackControls";
import { MixerTrackControls } from "./MixerUnits/MixerTrackControls";
import { SoundChainControls } from "./MixerUnits/SoundChainControls";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";
import { useSoundChainManager } from "../../hooks/useSoundChainManager";
import { MixerBar } from "../MixerBar";

interface MixerProps {
  onSelectParent: (parentId: string) => void;
}

export const Mixer: React.FC<MixerProps> = ({ onSelectParent }) => {
  const { trackOrder } = useTrackOperations();
  const { mixerTrackOrder } = useMixerTrackOperations();
  const { soundChains } = useSoundChainManager();

  return (
    <>
      <MixerBar />
      <div className="row-span-1 grid h-80 grid-cols-[1fr,auto] border border-border">
        <ScrollArea className="h-full [&>div>div]:h-full [&>div]:h-full [&_[data-radix-scroll-area-viewport]]:h-full">
          <div className="flex h-full flex-row">
            {/* Regular tracks */}
            {trackOrder.map((trackId, index) => (
              <CompositionTrackControls
                key={trackId}
                trackId={trackId}
                className={cn(index === 0 && "ml-1")}
              />
            ))}
            {/* Mixer tracks (excluding master) */}
            {mixerTrackOrder
              .filter((trackId) => trackId !== "master")
              .map((trackId) => (
                <MixerTrackControls
                  key={trackId}
                  trackId={trackId}
                  onSelectParent={onSelectParent}
                />
              ))}
            {/* Sound Chains */}
            {Object.keys(soundChains).map((soundChainId) => (
              <SoundChainControls
                key={soundChainId}
                soundChainId={soundChainId}
                onSelectParent={onSelectParent}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {/* Master unit - fixed position */}
        <MixerTrackControls
          key="master"
          trackId="master"
          onSelectParent={onSelectParent}
          className="border-l"
        />
      </div>
    </>
  );
};
