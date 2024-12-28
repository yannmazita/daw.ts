import { useState, useEffect, useCallback } from "react";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import { useEngineStore } from "@/core/stores/useEngineStore";
import { useTransportEngine } from "@/core/engines/EngineManager";
import * as Tone from "tone";

export const PositionDisplay: React.FC = () => {
  const duration = useEngineStore((state) => state.transport.duration);
  const isPlaying = useEngineStore((state) => state.transport.isPlaying);
  const seekTo = useTransportEngine().seekTo;
  const getPosition = useTransportEngine().getTransportPosition;
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
      setDisplayPosition(formatPosition(Tone.Time(getPosition()).toSeconds()));
    }
  }, [getPosition, isEditing, formatPosition]);

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
      // Validate and convert input to seconds
      const newPosition = Tone.Time(editValue).toSeconds();
      seekTo(newPosition);
      setDisplayPosition(formatPosition(newPosition));
    } catch (error) {
      console.error("Invalid position format:", error);
      setEditValue(displayPosition); // Revert on invalid input
    } finally {
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    setEditValue(displayPosition); // Revert any unsaved changes
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
            onBlur={handleBlur}
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
        {formatPosition(Tone.Time(duration).toSeconds())}
      </div>
    </div>
  );
};
