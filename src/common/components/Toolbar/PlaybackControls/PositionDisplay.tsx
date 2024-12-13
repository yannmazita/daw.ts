// src/common/components/PlaybackControls/PositionDisplay.tsx
import { useState, useEffect, useCallback } from "react";
import { useStore } from "@/common/slices/useStore";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import * as Tone from "tone";

export const PositionDisplay: React.FC = () => {
  const { position, length, isPlaying, seekTo } = useStore();
  const [displayPosition, setDisplayPosition] = useState("0:0:0");
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("0:0:0");

  // Format position as bars:beats:sixteenths
  const formatPosition = useCallback((pos: number): string => {
    return Tone.Time(pos).toBarsBeatsSixteenths();
  }, []);

  // Update display when position changes
  useEffect(() => {
    if (!isEditing) {
      setDisplayPosition(formatPosition(position));
    }
  }, [position, isEditing, formatPosition]);

  // Handle manual position input
  const handlePositionClick = () => {
    if (!isPlaying) {
      setIsEditing(true);
      setEditValue(displayPosition);
    }
  };

  const handlePositionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };

  const handlePositionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Validate and convert input to time
      const newPosition = Tone.Time(editValue).toBarsBeatsSixteenths();
      seekTo(newPosition);
      setDisplayPosition(newPosition);
    } catch (error) {
      // Revert to current position on invalid input
      setEditValue(displayPosition);
    }
    setIsEditing(false);
  };

  return (
    <div className="flex items-center space-x-2">
      <Label className="text-sm text-muted-foreground">Position</Label>
      {isEditing ? (
        <form onSubmit={handlePositionSubmit} className="flex items-center">
          <Input
            type="text"
            value={editValue}
            onChange={handlePositionChange}
            className="w-24 font-mono"
            autoFocus
            onBlur={() => setIsEditing(false)}
            pattern="[0-9]+:[0-9]+:[0-9]+"
            title="Format: bars:beats:sixteenths"
          />
        </form>
      ) : (
        <div
          onClick={handlePositionClick}
          className={`w-24 rounded border border-transparent px-3 py-1 font-mono ${
            !isPlaying ? "cursor-pointer hover:border-border" : ""
          }`}
        >
          {displayPosition}
        </div>
      )}
      <span className="text-sm text-muted-foreground">/</span>
      <div className="w-24 font-mono text-muted-foreground">
        {formatPosition(length)}
      </div>
    </div>
  );
};
