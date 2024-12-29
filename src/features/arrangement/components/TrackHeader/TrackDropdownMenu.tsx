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
