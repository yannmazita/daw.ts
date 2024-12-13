// src/features/session/components/ClipSlot/EmptySlot.tsx
import { Button } from "@/common/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/shadcn/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/shadcn/ui/dropdown-menu";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useStore } from "@/common/slices/useStore";
import { InstrumentName } from "@/core/types/instrument";
import { Music, Plus, Waves } from "lucide-react";
import { useState } from "react";

interface EmptySlotProps {
  trackId: string;
  index: number;
}

export const EmptySlot: React.FC<EmptySlotProps> = ({ trackId, index }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [patternType, setPatternType] = useState<"audio" | "instrument" | null>(
    null,
  );
  const [name, setName] = useState("");
  const [instrument, setInstrument] = useState<InstrumentName>(
    InstrumentName.Synth,
  );

  const createPattern = useStore((state) => state.createPattern);
  const addPlaylistPattern = useStore((state) => state.addPlaylistPattern);
  const createInstrumentTrack = useStore(
    (state) => state.createInstrumentTrack,
  );
  const createAudioTrack = useStore((state) => state.createAudioTrack);

  const handlePatternTypeSelect = (type: "audio" | "instrument") => {
    setPatternType(type);
    setIsDropdownOpen(false);
    setIsDialogOpen(true);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !patternType) return;

    try {
      // Create the pattern
      const patternId = createPattern(name, [4, 4]); // Default time signature

      // If it's an instrument pattern, create the instrument track within the pattern
      if (patternType === "instrument") {
        createInstrumentTrack(patternId, name, instrument);
      } else {
        createAudioTrack(patternId, name);
      }

      // Assign the pattern to the clip slot
      addPlaylistPattern(trackId, patternId, index.toString());

      // Reset form
      setName("");
      setInstrument(InstrumentName.Synth);
      setIsDialogOpen(false);
      setPatternType(null);
    } catch (error) {
      console.error("Error creating pattern:", error);
      // Handle error (show notification, etc.)
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="h-full w-full justify-center rounded-none border-2 border-dashed border-border"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem
            onSelect={() => handlePatternTypeSelect("instrument")}
          >
            <Music className="mr-2 h-4 w-4" />
            Create MIDI Pattern
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => handlePatternTypeSelect("audio")}>
            <Waves className="mr-2 h-4 w-4" />
            Create Audio Pattern
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            Create New {patternType === "audio" ? "Audio" : "MIDI"} Pattern
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="patternName">Pattern Name</Label>
            <Input
              id="patternName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter pattern name"
              autoFocus
            />
          </div>
          {patternType === "instrument" && (
            <div>
              <Label htmlFor="instrument">Instrument Type</Label>
              <Select
                value={instrument}
                onValueChange={(value) =>
                  setInstrument(value as InstrumentName)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select instrument" />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(InstrumentName).map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button type="submit">Create Pattern</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
