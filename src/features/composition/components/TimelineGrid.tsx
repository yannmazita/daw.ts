// src/features/composition/components/TimelineGrid.tsx
import { useTrackOperations } from "@/features/mix/hooks/useTrackOperations";
import { TrackLane } from "./TrackLane";
import { TrackHeader } from "./TrackHeader";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";
import { useDummyTrack } from "@/features/mix/hooks/useDummyTrack";
import { DummyTrackHeader, DummyTrackLane } from "./DummyTrack";
import { useSelection } from "@/common/hooks/useSelection";

export const TimelineGrid: React.FC = () => {
  const { tracksOrder } = useTrackOperations();
  const dummyTrackIds = useDummyTrack(tracksOrder.length);
  const { handleClickedTrack } = useSelection();

  return (
    <div className="h-full overflow-hidden border border-border">
      <ScrollArea className="h-full" type="scroll">
        <div className="grid grid-cols-[auto,1fr]">
          {/* Fixed Headers Column */}
          <div className="border-r border-border bg-background">
            {tracksOrder.map((trackId) => (
              <TrackHeader
                key={trackId}
                trackId={trackId}
                onClick={() => handleClickedTrack(trackId)}
              />
            ))}
            {dummyTrackIds.map((dummyId) => (
              <DummyTrackHeader
                key={dummyId}
                onClick={() => handleClickedTrack(dummyId)}
              />
            ))}
          </div>

          {/* Scrollable Lanes */}
          <ScrollArea className="h-full" type="scroll">
            <div className="flex flex-col">
              {tracksOrder.map((trackId, index) => (
                <TrackLane
                  key={trackId}
                  trackId={trackId}
                  className={cn(
                    index === tracksOrder.length - 1 &&
                      dummyTrackIds.length === 0 &&
                      "border-b-0",
                  )}
                  onClick={() => handleClickedTrack(trackId)}
                />
              ))}
              {dummyTrackIds.map((dummyId, index) => (
                <DummyTrackLane
                  key={dummyId}
                  className={cn(
                    index === dummyTrackIds.length - 1 && "border-b-0",
                  )}
                  onClick={() => handleClickedTrack(dummyId)}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
