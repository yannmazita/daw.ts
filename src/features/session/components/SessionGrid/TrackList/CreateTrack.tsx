// src/features/session/components/TrackList/CreateTrack.tsx
import { Button } from "@/common/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/common/shadcn/ui/dialog";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import { useStore } from "@/common/slices/useStore";
import { Plus } from "lucide-react";
import { useState } from "react";

export const CreateTrack = () => {
  const createPlaylistTrack = useStore((state) => state.createPlaylistTrack);
  const [isOpen, setIsOpen] = useState(false);
  const [trackName, setTrackName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackName.trim()) {
      createPlaylistTrack(trackName);
      setTrackName("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start"
        onClick={() => setIsOpen(true)}
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Track
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Track</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="trackName">Track Name</Label>
            <Input
              id="trackName"
              value={trackName}
              onChange={(e) => setTrackName(e.target.value)}
              placeholder="Enter track name"
              autoFocus
            />
          </div>
          <Button type="submit">Create Track</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
