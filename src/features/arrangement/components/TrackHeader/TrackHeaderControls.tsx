// src/features/arrangement/components/TrackHeader/TrackHeaderControls.tsx
import { Button } from "@/common/shadcn/ui/button";
import { Slider } from "@/common/shadcn/ui/slider";
import { Volume2, VolumeX, Headphones } from "lucide-react";
import { useMixerTrackControls } from "../../hooks/useMixerTrackControls";

interface TrackHeaderControlsProps {
  trackId: string;
}

export const TrackHeaderControls: React.FC<TrackHeaderControlsProps> = ({
  trackId,
}) => {
  const { volume, muted, soloed, setVolume, toggleMute, toggleSolo } =
    useMixerTrackControls(trackId);

  const handleVolumeChange = (values: number[]) => {
    setVolume(values[0]);
  };

  return (
    <>
      <div className="mt-1 flex items-center gap-1">
        <Button
          variant={muted ? "default" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onClick={toggleMute}
        >
          {muted ? (
            <VolumeX className="h-4 w-4" />
          ) : (
            <Volume2 className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant={soloed ? "default" : "ghost"}
          size="sm"
          className="h-6 w-6 p-0"
          onClick={toggleSolo}
        >
          <Headphones className="h-4 w-4" />
        </Button>
      </div>
      <div className="mt-2 flex items-center">
        <Slider
          value={[volume]}
          max={6}
          min={-70}
          step={0.1}
          className="w-24"
          onValueChange={handleVolumeChange}
        />
      </div>
    </>
  );
};
