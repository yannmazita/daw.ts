// src/features/mixer/components/controls/ChannelHeader.tsx

import React from "react";
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { X } from "lucide-react";
import { cn } from "@/common/shadcn/lib/utils";

interface Props {
  name: string;
  mute: boolean;
  solo: boolean;
  onMute: () => void;
  onSolo: () => void;
  onNameChange?: (name: string) => void;
  onDelete?: () => void;
  className?: string;
}

const ChannelHeader: React.FC<Props> = ({
  name,
  mute,
  solo,
  onMute,
  onSolo,
  onNameChange,
  onDelete,
  className,
}) => {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div className="flex flex-row">
        <Input
          value={name}
          onChange={(e) => onNameChange?.(e.target.value)}
          className="h-6 text-sm px-2"
          disabled={!onNameChange}
        />
        {!onDelete ? null : (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "h-6 w-6 p-0",
              "hover:bg-slate-300",
              "active:bg-slate-400",
            )}
            onClick={onDelete}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      <div className="flex gap-1">
        <Button
          variant={mute ? "destructive" : "secondary"}
          size="sm"
          className="flex-1 h-6 text-xs"
          onClick={onMute}
        >
          M
        </Button>
        <Button
          variant={solo ? "default" : "secondary"}
          size="sm"
          className="flex-1 h-6 text-xs"
          onClick={onSolo}
        >
          S
        </Button>
      </div>
    </div>
  );
};

export default ChannelHeader;
