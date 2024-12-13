// src/features/session/components/SceneList/SceneContextMenu.tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import { useStore } from "@/common/slices/useStore";
import { Trash2 } from "lucide-react";

interface SceneContextMenuProps {
  children: React.ReactNode;
  sceneId: string;
}

export const SceneContextMenu: React.FC<SceneContextMenuProps> = ({
  children,
  sceneId,
}) => {
  const deleteScene = useStore((state) => state.deleteScene);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => deleteScene(sceneId)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Scene
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
