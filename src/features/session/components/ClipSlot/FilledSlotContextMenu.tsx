// src/features/session/components/ClipSlot/FilledSlotContextMenu.tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import { useStore } from "@/common/slices/useStore";
import { Pattern } from "@/core/interfaces/pattern";
import { FollowAction, LaunchQuantization } from "@/core/types/common";
import { Clock, Copy, Forward, Pencil, Scissors, Trash2 } from "lucide-react";

interface FilledSlotContextMenuProps {
  children: React.ReactNode;
  pattern: Pattern;
  trackId: string;
  index: number;
}

export const FilledSlotContextMenu: React.FC<FilledSlotContextMenuProps> = ({
  children,
  pattern,
  trackId,
  index,
}) => {
  const removePattern = useStore((state) => state.removePlaylistPattern);
  const duplicatePattern = useStore((state) => state.duplicatePattern);
  const updatePattern = useStore((state) => state.updatePattern);
  const setClipQuantization = useStore((state) => state.setClipQuantization);

  const handleDuplicate = () => {
    const newPatternId = duplicatePattern(pattern.id);
    // todo: need to add the duplicated pattern to the next empty slot
    // todo: need additional logic to find the next empty slot
  };

  const handleQuantizationChange = (quantization: LaunchQuantization) => {
    updatePattern(pattern.id, { quantization });
  };

  const handleFollowAction = (action: FollowAction) => {
    updatePattern(pattern.id, {
      followAction: {
        action,
        chance: 1,
        time: pattern.duration,
      },
    });
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => console.log("Edit pattern")}>
          <Pencil className="mr-2 h-4 w-4" />
          Edit Pattern
        </ContextMenuItem>
        <ContextMenuItem onClick={handleDuplicate}>
          <Copy className="mr-2 h-4 w-4" />
          Duplicate
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Quantization Settings */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Clock className="mr-2 h-4 w-4" />
            Launch Quantization
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {Object.values(LaunchQuantization).map((q) => (
              <ContextMenuItem
                key={q}
                onClick={() => handleQuantizationChange(q)}
              >
                <span className="mr-2 h-4 w-4">
                  {pattern.quantization === q ? "✓" : ""}
                </span>
                {q === LaunchQuantization.NONE
                  ? "None"
                  : q === LaunchQuantization.ONE_BAR
                    ? "1 Bar"
                    : q === LaunchQuantization.TWO_BARS
                      ? "2 Bars"
                      : "4 Bars"}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        {/* Follow Actions */}
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Forward className="mr-2 h-4 w-4" />
            Follow Action
          </ContextMenuSubTrigger>
          <ContextMenuSubContent>
            {Object.values(FollowAction).map((action) => (
              <ContextMenuItem
                key={action}
                onClick={() => handleFollowAction(action)}
              >
                <span className="mr-2 h-4 w-4">
                  {pattern.followAction?.action === action ? "✓" : ""}
                </span>
                {action.charAt(0).toUpperCase() + action.slice(1)}
              </ContextMenuItem>
            ))}
          </ContextMenuSubContent>
        </ContextMenuSub>

        <ContextMenuSeparator />

        <ContextMenuItem
          onClick={() => removePattern(trackId, pattern.id)}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Pattern
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
