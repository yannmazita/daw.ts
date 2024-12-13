// src/features/session/components/TrackControls/PanControl.tsx
import { Slider } from "@/common/shadcn/ui/slider";
import { useStore } from "@/common/slices/useStore";
import { ArrowLeftRight } from "lucide-react";

interface PanControlProps {
  trackId: string;
  pan: number;
}

export const PanControl: React.FC<PanControlProps> = ({ trackId, pan }) => {
  const updateTrack = useStore((state) => state.updatePlaylistTrack);

  const handlePanChange = (value: number[]) => {
    updateTrack(trackId, { pan: value[0] });
  };

  return (
    <div className="flex items-center gap-2">
      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
      <Slider
        defaultValue={[pan]}
        max={1}
        min={-1}
        step={0.01}
        onValueChange={handlePanChange}
        className="w-full"
      />
    </div>
  );
};
