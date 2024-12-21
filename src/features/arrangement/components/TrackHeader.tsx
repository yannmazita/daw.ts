// src/features/arrangement/components/TrackHeader.tsx
import { useState, useCallback } from "react";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useArrangementEngine } from "@/core/engines/EngineManager";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { Slider } from "@/common/shadcn/ui/slider";
import {
  ChevronRight,
  ChevronDown,
  Mic,
  Music2,
  Volume2,
  Headphones,
  Settings,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { TrackMeter } from "./TrackMeter";
import { DraggableTrackHeader } from "./DraggableTrackHeader";
import { cn } from "@/common/shadcn/lib/utils";

interface TrackHeaderProps {
  trackId: string;
}

// Selector for track-specific state
const useTrackState = (trackId: string) => {
  return useEngineStore((state) => ({
    track: state.arrangement.tracks[trackId],
    isFolded: state.arrangement.foldedTracks.has(trackId),
    isSelected: state.arrangement.selectedTracks.has(trackId),
    height: state.arrangement.viewSettings.trackHeights[trackId],
    automationLanes: state.arrangement.visibleAutomationLanes[trackId] || [],
  }));
};

export const TrackHeader: React.FC<TrackHeaderProps> = ({ trackId }) => {
  const { track, isFolded, isSelected, height } = useTrackState(trackId);
  const arrangementEngine = useArrangementEngine();
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(track.name);

  const handleNameSubmit = useCallback(() => {
    // TODO: Implement name update through engine
    setIsEditing(false);
  }, []);

  const handleFoldToggle = useCallback(() => {
    arrangementEngine.toggleTrackFold(trackId);
  }, [arrangementEngine, trackId]);

  const handleSelect = useCallback(
    (event: React.MouseEvent) => {
      let newSelection = new Set<string>();

      if (event.shiftKey && isSelected) {
        // Handle shift+click for range selection
        // todo: Implement range selection
      } else if (event.ctrlKey || event.metaKey) {
        // Handle ctrl/cmd+click for multiple selection
        const currentSelection =
          useEngineStore.getState().arrangement.selectedTracks;
        newSelection = new Set(currentSelection);
        if (isSelected) {
          newSelection.delete(trackId);
        } else {
          newSelection.add(trackId);
        }
      } else {
        // Single selection
        newSelection.add(trackId);
      }

      arrangementEngine.setSelection(newSelection);
    },
    [arrangementEngine, trackId, isSelected],
  );

  return (
    <DraggableTrackHeader track={track} index={track.index}>
      <div
        className={cn(
          "flex h-full flex-col border-b border-border bg-card px-2 py-1",
          isSelected && "bg-accent",
          "select-none",
        )}
        onClick={handleSelect}
        style={{ height }}
      >
        <div className="flex items-center space-x-2">
          {/* Fold Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={handleFoldToggle}
          >
            {isFolded ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>

          {/* Track Type Icon */}
          {track.type === "audio" ? (
            <Mic className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Music2 className="h-4 w-4 text-muted-foreground" />
          )}

          {/* Track Name */}
          {isEditing ? (
            <Input
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              onBlur={handleNameSubmit}
              onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
              className="h-6 w-32"
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer text-sm font-medium hover:text-primary"
              onClick={() => setIsEditing(true)}
              style={{ color: track.color }}
            >
              {track.name}
            </span>
          )}

          {/* Track Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                Rename Track
              </DropdownMenuItem>
              <DropdownMenuItem>Change Color</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Insert Return Track</DropdownMenuItem>
              <DropdownMenuItem>Group Track</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive">
                Delete Track
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {!isFolded && (
          <>
            {/* Track Controls */}
            <div className="mt-1 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                // todo: Implement mute (through MixEngine?)
              >
                <Volume2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                // todo: Implement solo (through MixEngine?)
              >
                <Headphones className="h-4 w-4" />
              </Button>
            </div>

            {/* Volume Slider and Meter */}
            <div className="mt-2 flex items-center gap-2">
              <Slider
                value={[0]} // todo: Get (from MixEngine?)
                max={0}
                min={-70}
                step={0.1}
                className="w-24"
                // todo: Implement volume (through MixEngine?)
              />
              {/*<TrackMeter trackId={track.mixerChannelId}/>*/}
            </div>
          </>
        )}
      </div>
    </DraggableTrackHeader>
  );
};
