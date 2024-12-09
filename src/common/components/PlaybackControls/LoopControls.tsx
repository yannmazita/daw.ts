// src/common/components/PlaybackControls/LoopControls.tsx
import { useStore } from "@/common/slices/useStore";
import { Input } from "@/common/shadcn/ui/input";
import { Switch } from "@/common/shadcn/ui/switch";
import { Label } from "@/common/shadcn/ui/label";
import { Repeat } from "lucide-react";
import { useState } from "react";

export function LoopControls() {
  const { isLooping, loopStart, loopEnd, setLoop } = useStore();
  const [localStart, setLocalStart] = useState(loopStart);
  const [localEnd, setLocalEnd] = useState(loopEnd);

  const handleLoopToggle = (enabled: boolean) => {
    setLoop(enabled, localStart, localEnd);
  };

  const handleLoopPointsChange = () => {
    setLoop(isLooping, localStart, localEnd);
  };

  return (
    <div className="flex items-center space-x-4">
      {isLooping && (
        <div className="flex items-center space-x-2">
          <Input
            value={localStart}
            onChange={(e) => setLocalStart(e.target.value)}
            onBlur={handleLoopPointsChange}
            className="w-24"
            placeholder="0:0:0"
          />
          <span className="text-muted-foreground dark:text-muted-foreground">
            to
          </span>
          <Input
            value={localEnd}
            onChange={(e) => setLocalEnd(e.target.value)}
            onBlur={handleLoopPointsChange}
            className="w-24"
            placeholder="4:0:0"
          />
        </div>
      )}
      <div className="flex items-center space-x-2">
        <Switch
          checked={isLooping}
          onCheckedChange={handleLoopToggle}
          id="loop-toggle"
        />
        <Label htmlFor="loop-toggle" className="flex items-center">
          <Repeat className="mr-1 h-4 w-4" />
          Loop
        </Label>
      </div>
    </div>
  );
}
