// src/features/session/components/TrackList/TrackContextMenu.tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import { useStore } from "@/common/slices/useStore";
import { Trash2 } from "lucide-react";

interface TrackContextMenuProps {
  children: React.ReactNode;
  trackId: string;
}

export const TrackContextMenu: React.FC<TrackContextMenuProps> = ({
  children,
  trackId,
}) => {
  const deleteTrack = useStore((state) => state.deletePlaylistTrack);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem
          className="text-destructive focus:text-destructive"
          onClick={() => deleteTrack(trackId)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Track
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
