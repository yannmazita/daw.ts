// src/features/patterns/components/ChannelRack.tsx

import { useCallback } from "react";
import { useStore } from "@/common/slices/useStore";
import { Button } from "@/common/shadcn/ui/button";
import { Plus } from "lucide-react";
import { InstrumentName } from "@/core/types/instrument";

export function ChannelRack() {
  const currentPattern = useStore((state) => state.getCurrentPattern());
  const addTrack = useStore((state) => state.addTrack);

  const handleAddChannel = useCallback(() => {
    if (!currentPattern) return;

    const channelNumber = currentPattern.tracks.length + 1;
    addTrack(
      currentPattern.id,
      `Channel ${channelNumber}`,
      "instrument",
      InstrumentName.Synth,
    );
  }, [currentPattern, addTrack]);

  if (!currentPattern) {
    return (
      <div className="flex h-48 items-center justify-center rounded-lg border border-border">
        <p className="text-muted-foreground">No pattern selected</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col rounded-lg border border-border">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border p-2">
        <h2 className="text-sm font-medium">Channel Rack</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddChannel}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Channels List */}
      <div className="flex max-h-[24rem] min-h-[12rem] flex-col overflow-y-auto">
        {currentPattern.tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center border-b border-border p-2 hover:bg-accent"
          >
            {/* Channel Controls */}
            <div className="flex w-48 items-center space-x-2">
              <div className="flex-1 truncate">{track.name}</div>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-8 ${track.muted ? "bg-destructive" : ""}`}
                onClick={() => {
                  /* Toggle mute */
                }}
              >
                M
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-6 w-8 ${track.soloed ? "bg-primary" : ""}`}
                onClick={() => {
                  /* Toggle solo */
                }}
              >
                S
              </Button>
            </div>

            {/* Step Sequencer Grid Placeholder */}
            <div className="ml-2 h-12 flex-1 rounded bg-accent/20">
              {/* Step sequencer will go here */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
