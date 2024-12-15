// src/features/arrangement/components/TrackHeader.tsx
import { useState } from "react";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { Slider } from "@/common/shadcn/ui/slider";
import {
  Mic,
  Music2,
  Volume2,
  VolumeX,
  Headphones,
  MoreHorizontal,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { TrackMeter } from "./TrackMeter";
import { GRID_CONSTANTS } from "../utils/constants";

interface TrackHeaderProps {
  track: {
    id: string;
    name: string;
    type: "audio" | "instrument";
    color?: string;
    isMuted?: boolean;
    isSoloed?: boolean;
    volume: number;
    pan: number;
  };
  onUpdate: (id: string, updates: Partial<TrackHeaderProps["track"]>) => void;
}

export const TrackHeader: React.FC<TrackHeaderProps> = ({
  track,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(track.name);

  const handleNameSubmit = () => {
    onUpdate(track.id, { name: tempName });
    setIsEditing(false);
  };

  return (
    <div
      className="flex h-full flex-col border-b border-border bg-card px-2 py-1"
      style={{ height: GRID_CONSTANTS.TRACK_HEIGHT }}
    >
      <div className="flex items-center justify-between">
        {/* Track Name */}
        <div className="flex items-center gap-2">
          {track.type === "audio" ? (
            <Mic className="h-4 w-4 text-muted-foreground" />
          ) : (
            <Music2 className="h-4 w-4 text-muted-foreground" />
          )}
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
            >
              {track.name}
            </span>
          )}
        </div>

        {/* Track Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate Track</DropdownMenuItem>
            <DropdownMenuItem>Delete Track</DropdownMenuItem>
            <DropdownMenuItem>Group Track</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Track Controls */}
      <div className="mt-1 flex items-center gap-1">
        <Button
          variant={track.isMuted ? "default" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onUpdate(track.id, { isMuted: !track.isMuted })}
        >
          {track.isMuted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={track.isSoloed ? "default" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onClick={() => onUpdate(track.id, { isSoloed: !track.isSoloed })}
        >
          <Headphones className="h-4 w-4" />
        </Button>
      </div>

      {/* Volume Slider and Meter */}
      <div className="mt-2 flex items-center gap-2">
        <Slider
          value={[track.volume]}
          max={0}
          min={-70}
          step={0.1}
          className="w-24"
          onValueChange={([value]) => onUpdate(track.id, { volume: value })}
        />
        <TrackMeter trackId={track.id} />
      </div>
    </div>
  );
};
