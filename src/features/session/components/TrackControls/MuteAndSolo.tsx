// src/features/session/components/TrackControls/MuteAndSolo.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useStore } from "@/common/slices/useStore";
import { Headphones, VolumeX } from "lucide-react";
import { cn } from "@/common/shadcn/lib/utils";

interface MuteAndSoloProps {
  trackId: string;
  mute: boolean;
  solo: boolean;
}

export const MuteAndSolo: React.FC<MuteAndSoloProps> = ({
  trackId,
  mute,
  solo,
}) => {
  const updateTrack = useStore((state) => state.updatePlaylistTrack);

  return (
    <div className="flex gap-1">
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1",
          mute &&
            "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        )}
        onClick={() => updateTrack(trackId, { mute: !mute })}
      >
        <VolumeX className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        className={cn(
          "flex-1",
          solo && "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
        onClick={() => updateTrack(trackId, { solo: !solo })}
      >
        <Headphones className="h-4 w-4" />
      </Button>
    </div>
  );
};
