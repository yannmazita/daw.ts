// src/features/patterns/components/PatternListItem.tsx
import { PatternData } from "@/core/interfaces/pattern";
import { Copy, Trash2, Pencil } from "lucide-react";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
} from "@/common/shadcn/ui/sidebar";
import { Input } from "@/common/shadcn/ui/input";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/common/shadcn/lib/utils";

interface PatternListItemProps {
  pattern: PatternData;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onRename: (id: string, newName: string) => void;
}

export const PatternListItem: React.FC<PatternListItemProps> = ({
  pattern,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
  onRename,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(pattern.name);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditValue(pattern.name);
    setIsEditing(true);
  };

  const handleSave = () => {
    const newName = editValue.trim();
    if (newName && newName !== pattern.name) {
      onRename(pattern.id, newName);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setIsEditing(false);
      setEditValue(pattern.name);
    }
    e.stopPropagation();
  };

  const handleBlur = () => {
    handleSave();
  };
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isSelected}
        onClick={() => !isEditing && onSelect(pattern.id)}
        tooltip={`${pattern.timeSignature.join("/")} time signature`}
        className={cn(
          "group/pattern",
          isEditing && "pointer-events-none bg-sidebar-accent",
        )}
      >
        {isEditing ? (
          <Input
            ref={inputRef}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "h-6 border-none bg-transparent px-0 py-0",
              "text-sidebar-foreground placeholder:text-sidebar-foreground/60",
              "focus-visible:ring-1 focus-visible:ring-sidebar-ring focus-visible:ring-offset-0",
            )}
          />
        ) : (
          <>
            <span>{pattern.name}</span>
            <span className="ml-auto text-xs text-sidebar-foreground/50">
              {pattern.timeSignature.join("/")}
            </span>
          </>
        )}
      </SidebarMenuButton>

      {!isEditing && (
        <>
          <SidebarMenuAction
            onClick={handleStartEdit}
            showOnHover
            className="right-[5.25rem] text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <Pencil className="h-4 w-4" />
          </SidebarMenuAction>
          <SidebarMenuAction
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate(pattern.id);
            }}
            showOnHover
            className="right-[2.75rem] text-sidebar-foreground/50 hover:text-sidebar-foreground"
          >
            <Copy className="h-4 w-4" />
          </SidebarMenuAction>
          <SidebarMenuAction
            onClick={(e) => {
              e.stopPropagation();
              onDelete(pattern.id);
            }}
            showOnHover
            className="text-sidebar-foreground/50 hover:text-destructive"
          >
            <Trash2 className="h-4 w-4" />
          </SidebarMenuAction>
        </>
      )}
    </SidebarMenuItem>
  );
};
