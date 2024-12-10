// src/features/patterns/components/PatternListItem.tsx

import { Pattern } from "@/core/interfaces/pattern";
import { Button } from "@/common/shadcn/ui/button";
import { Trash2, Copy } from "lucide-react";
import React from "react";

interface PatternListItemProps {
  pattern: Pattern;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
}

export const PatternListItem: React.FC<PatternListItemProps> = ({
  pattern,
  isSelected,
  onSelect,
  onDelete,
  onDuplicate,
}: PatternListItemProps) => {
  return (
    <div
      className={`flex cursor-pointer items-center justify-between p-2 hover:bg-accent/50 ${
        isSelected ? "bg-accent" : ""
      }`}
      onClick={() => onSelect(pattern.id)}
    >
      <div className="flex items-center gap-2">
        <span className="font-medium">{pattern.name}</span>
        <span className="text-sm text-muted-foreground">
          {pattern.timeSignature.join("/")}
        </span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDuplicate(pattern.id);
          }}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(pattern.id);
          }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
