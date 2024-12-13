// src/features/session/components/TrackControls/VolumeControl.tsx
import { Slider } from "@/common/shadcn/ui/slider";
import { useStore } from "@/common/slices/useStore";
import { Volume2 } from "lucide-react";

interface VolumeControlProps {
  trackId: string;
  volume: number;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({
  trackId,
  volume,
}) => {
  const updateTrack = useStore((state) => state.updatePlaylistTrack);

  const handleVolumeChange = (value: number[]) => {
    updateTrack(trackId, { volume: value[0] });
  };

  return (
    <div className="flex items-center gap-2">
      <Volume2 className="h-4 w-4 text-muted-foreground" />
      <Slider
        defaultValue={[volume]}
        max={6}
        min={-70}
        step={0.1}
        onValueChange={handleVolumeChange}
        className="w-full"
      />
    </div>
  );
};
