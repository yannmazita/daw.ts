// src/common/components/PlaybackControls/PlaybackControls.tsx
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { Input } from "@/common/shadcn/ui/input";
import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { TimeSignatureControl } from "./TimeSignatureControl";
import { LoopControls } from "./LoopControls";
import { TempoTap } from "./TempoTap";
import { PositionDisplay } from "./PositionDisplay";
import { TransportBar } from "./TransportBar";
import { Label } from "@/common/shadcn/ui/label";
import { Button } from "@/common/shadcn/ui/button";

export const PlaybackControls: React.FC = () => {
  const isPlaying = useEngineStore((state) => state.transport.isPlaying);
  const tempo = useEngineStore((state) => state.transport.tempo);
  const play = useCallback(
    useTransportEngine().play.bind(useTransportEngine()),
    [useTransportEngine()],
  );
  const pause = useCallback(
    useTransportEngine().pause.bind(useTransportEngine()),
    [useTransportEngine()],
  );
  const stop = useCallback(
    useTransportEngine().stop.bind(useTransportEngine()),
    [useTransportEngine()],
  );
  const setTempo = useCallback(
    useTransportEngine().setTempo.bind(useTransportEngine()),
    [useTransportEngine()],
  );
  const [localBpm, setLocalBpm] = useState(tempo.toString());

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBpm(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 20 && numValue <= 300) {
      setTempo(numValue);
    }
  };

  useEffect(() => {
    setLocalBpm(tempo.toString());
  }, [tempo]);

  return (
    <div className="flex flex-col space-y-2 rounded-lg bg-card p-4 text-card-foreground dark:bg-card dark:text-card-foreground">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Transport Controls */}
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="icon">
              <SkipBack className="h-5 w-5" />
            </Button>
            {isPlaying ? (
              <Button variant="ghost" size="icon" onClick={() => pause()}>
                <Pause className="h-5 w-5" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={() => play()}>
                <Play className="h-5 w-5" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => stop()}>
              <Square className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <SkipForward className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Loop Controls */}
        <LoopControls />
      </div>
      <TransportBar />

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          {/* Tempo Controls */}
          <div className="flex items-center space-x-2">
            <Label className="text-sm text-muted-foreground dark:text-muted-foreground">
              BPM
            </Label>
            <Input
              type="number"
              value={localBpm}
              onChange={handleBpmChange}
              className="w-20"
              min={20}
              max={300}
            />
            <TempoTap />
          </div>

          {/* Time Signature */}
          <TimeSignatureControl />

          {/* Position Display */}
          <PositionDisplay />
        </div>
      </div>
    </div>
  );
};
