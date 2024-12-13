// src/features/session/components/SessionGrid/SceneList/SceneRow.tsx
import { Button } from "@/common/shadcn/ui/button";
import { Scene } from "@/core/interfaces/session";
import { Play } from "lucide-react";
import { useStore } from "@/common/slices/useStore";

interface SceneRowProps {
  scene: Scene;
}

export const SceneRow: React.FC<SceneRowProps> = ({ scene }) => {
  const launchScene = useStore((state) => state.launchScene);

  return (
    <div className="flex h-24 items-center border-b border-border p-2">
      <Button
        variant="ghost"
        className="h-full w-full justify-start gap-2 rounded-sm"
        onClick={() => launchScene(scene.id)}
      >
        <Play className="h-4 w-4" />
        <span className="truncate text-sm">{scene.name}</span>
      </Button>
    </div>
  );
};
