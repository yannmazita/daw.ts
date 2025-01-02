// src/features/mix/components/MixerControls/MixerControls.tsx
import { useTrackOperations } from "@/features/composition/hooks/useTrackOperations";
import { useMixerTrackOperations } from "../../hooks/useMixerTrackOperations";
import { TrackUnit } from "./TrackUnit";
import { MixerUnit } from "./MixerUnit";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";

export const MixerControls: React.FC = () => {
  const { trackOrder } = useTrackOperations();
  const { mixerTrackOrder } = useMixerTrackOperations();

  return (
    <div className="row-span-1 grid h-full grid-cols-[1fr,auto] border border-border">
      <ScrollArea className="h-full [&>div>div]:h-full [&>div]:h-full [&_[data-radix-scroll-area-viewport]]:h-full">
        <div className="flex h-full flex-row">
          {/* Regular tracks */}
          {trackOrder.map((trackId, index) => (
            <TrackUnit
              key={trackId}
              trackId={trackId}
              className={cn(index === 0 && "ml-1")}
            />
          ))}
          {/* Mixer tracks (excluding master) */}
          {mixerTrackOrder
            .filter((trackId) => trackId !== "master")
            .map((trackId) => (
              <MixerUnit key={trackId} trackId={trackId} />
            ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
      {/* Master unit - fixed position */}
      <MixerUnit key="master" trackId="master" className="border-l" />
    </div>
  );
};
