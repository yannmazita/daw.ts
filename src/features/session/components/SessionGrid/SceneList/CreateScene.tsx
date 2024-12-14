// src/features/session/components/SceneList/SceneControls.tsx
import { Button } from "@/common/shadcn/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common/shadcn/ui/dialog";
import { Input } from "@/common/shadcn/ui/input";
import { Label } from "@/common/shadcn/ui/label";
import { useStore } from "@/common/slices/useStore";
import { Plus } from "lucide-react";
import { useState } from "react";

export const CreateScene = () => {
  const createScene = useStore((state) => state.createScene);
  const [isOpen, setIsOpen] = useState(false);
  const [sceneName, setSceneName] = useState("");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (sceneName.trim()) {
      createScene(sceneName);
      setSceneName("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Scene
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Scene</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <Label htmlFor="sceneName">Scene Name</Label>
            <Input
              id="sceneName"
              value={sceneName}
              onChange={(e) => setSceneName(e.target.value)}
              placeholder="Enter scene name"
              autoFocus
            />
          </div>
          <Button type="submit">Create Scene</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
