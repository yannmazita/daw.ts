// src/common/components/PlaybackControls/PlaybackControls.tsx
import { useStore } from "@/common/slices/useStore";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { PlaybackMode } from "@/core/types/common";
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Square,
  Music2,
  ListMusic,
} from "lucide-react";
import { useState, useEffect } from "react";
import { TimeSignatureControl } from "./TimeSignatureControl";
import { LoopControls } from "./LoopControls";
import { TempoTap } from "./TempoTap";
import { Label } from "@/common/shadcn/ui/label";

export function PlaybackControls() {
  const { isPlaying, bpm, mode, play, stop, pause, setBpm, setMode } =
    useStore();
  const [localBpm, setLocalBpm] = useState(bpm.toString());

  const handleBpmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalBpm(value);
    const numValue = parseInt(value);
    if (!isNaN(numValue) && numValue >= 20 && numValue <= 300) {
      setBpm(numValue);
    }
  };

  useEffect(() => {
    setLocalBpm(bpm.toString());
  }, [bpm]);

  return (
    <div className="flex flex-col space-y-2 rounded-lg bg-slate-200 p-4 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {/* Mode Selection */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode(PlaybackMode.PATTERN)}
              className={
                mode === PlaybackMode.PATTERN
                  ? "bg-slate-300 dark:bg-slate-700"
                  : ""
              }
            >
              <Music2 className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMode(PlaybackMode.PLAYLIST)}
              className={
                mode === PlaybackMode.PLAYLIST
                  ? "bg-slate-300 dark:bg-slate-700"
                  : ""
              }
            >
              <ListMusic className="h-5 w-5" />
            </Button>
          </div>

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

      <div className="flex items-center space-x-6">
        {/* Tempo Controls */}
        <div className="flex items-center space-x-2">
          <Label className="text-sm text-slate-600 dark:text-slate-400">
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
      </div>
    </div>
  );
}
