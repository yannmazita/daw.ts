// src/common/components/PlaybackControls/PlaybackControls.tsx
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportEngine } from "@/core/engines/EngineManager";
import { Input } from "@/common/shadcn/ui/input";
import { Pause, Play, SkipBack, SkipForward, Square } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { TimeSignatureControl } from "./TimeSignatureControl";
import { TempoTap } from "./TempoTap";
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
    <div className="flexjflex-col">
      <div className="flex gap-x-4">
        <div className="flex items-center gap-x-2">
          {/* Tempo Controls */}
          <div className="flex items-center gap-x-2">
            <Input
              type="number"
              value={localBpm}
              onChange={handleBpmChange}
              className="input-no-wheel h-5 w-14 rounded-none py-1 text-center"
              min={20}
              max={300}
            />
            <TempoTap />
          </div>

          <TimeSignatureControl />
        </div>

        {/* Transport Controls */}
        <div className="flex items-center gap-x-1">
          <Button className="size-5 py-1" variant="ghost" size="icon">
            <SkipBack />
          </Button>
          {isPlaying ? (
            <Button
              className="size-5 py-1"
              variant="ghost"
              size="icon"
              onClick={() => pause()}
            >
              <Pause />
            </Button>
          ) : (
            <Button
              className="size-5 py-1"
              variant="ghost"
              size="icon"
              onClick={() => play()}
            >
              <Play />
            </Button>
          )}
          <Button
            className="size-5 py-1"
            variant="ghost"
            size="icon"
            onClick={() => stop()}
          >
            <Square />
          </Button>
          <Button className="size-5 py-1" variant="ghost" size="icon">
            <SkipForward />
          </Button>
        </div>
      </div>
    </div>
  );
};
