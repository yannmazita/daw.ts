// src/features/composition/components/TimelineGrid.tsx
import { useTrackOperations } from "@/features/mix/hooks/useTrackOperations";
import { TrackLane } from "./TrackLane";
import { TrackHeader } from "./TrackHeader";
import { cn } from "@/common/shadcn/lib/utils";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";

export const TimelineGrid: React.FC = () => {
  const { tracksOrder } = useTrackOperations();

  return (
    <div className="h-full overflow-hidden border border-border">
      <ScrollArea className="h-full" type="scroll">
        <div className="grid grid-cols-[auto,1fr]">
          {/* Fixed Headers Column */}
          <div className="border-r border-border bg-background">
            {tracksOrder.map((trackId) => (
              <TrackHeader key={trackId} trackId={trackId} />
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
                    index === tracksOrder.length - 1 && "border-b-0",
                  )}
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
