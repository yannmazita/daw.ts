// src/features/arrangement/components/TrackHeader/TrackDropdownMenu.tsx
import { Button } from "@/common/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { Settings } from "lucide-react";
import { useTrackOperations } from "../../hooks/useTrackOperations";
import { useClipEngine } from "@/core/engines/EngineManager";
import { useEngineStore } from "@/core/stores/useEngineStore";
import * as Tone from "tone";

interface TrackDropdownMenuProps {
  trackId: string;
  setIsEditing: (value: boolean) => void;
  isArrangement: boolean;
}

export const TrackDropdownMenu: React.FC<TrackDropdownMenuProps> = ({
  trackId,
  setIsEditing,
  isArrangement,
}) => {
  const { deleteTrack } = useTrackOperations();
  const clipEngine = useClipEngine();
  const transportTime = useEngineStore((state) => state.transport.duration);

  const handleCreateClip = (type: "audio" | "midi") => {
    if (type === "audio") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "audio/*";
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          try {
            const arrayBuffer = await file.arrayBuffer();
            // Create ToneAudioBuffer from ArrayBuffer
            const buffer = new Tone.ToneAudioBuffer(
              arrayBuffer,
              () => {
                const contentId = clipEngine.createAudioClip(buffer);
                clipEngine.addClip(contentId, transportTime);
              },
              (error) => {
                console.error("Error creating audio buffer:", error);
              },
            );
          } catch (error) {
            console.error("Error creating audio clip:", error);
          }
        }
      };
      input.click();
    } else if (type === "midi") {
      const contentId = clipEngine.createMidiClip({
        name: "New MIDI Clip",
        duration: 4,
        tracks: [],
      });
      clipEngine.addClip(contentId, transportTime);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-auto h-6 w-6 p-0">
          <Settings className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onSelect={() => setIsEditing(true)}>
          Rename Track
        </DropdownMenuItem>
        {isArrangement && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => handleCreateClip("audio")}>
              Add Audio Clip
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => handleCreateClip("midi")}>
              Add MIDI Clip
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => deleteTrack(trackId)}
              className="text-destructive"
            >
              Delete Track
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
