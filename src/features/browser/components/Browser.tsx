// src/features/browser/components/Browser.tsx
import {
  AudioLines,
  Drum,
  FileMusic,
  Folder,
  KeyboardMusic,
  Sparkles,
  SquarePlay,
  Workflow,
} from "lucide-react";
import { ScrollArea, ScrollBar } from "@/common/shadcn/ui/scroll-area";
import { cn } from "@/common/shadcn/lib/utils";
import { Tree, TreeDataItem } from "@/common/shadcn/Tree";

interface BrowserProps {
  className?: string;
}

export const Browser: React.FC<BrowserProps> = ({ className }) => {
  const data: TreeDataItem[] = [
    {
      id: "1",
      name: "All",
    },
    {
      id: "2",
      name: "Sound Chains",
      icon: AudioLines,
    },
    {
      id: "3",
      name: "Audio Effects",
      icon: Sparkles,
    },
    {
      id: "4",
      name: "MIDI Effects",
      icon: KeyboardMusic,
    },
    {
      id: "5",
      name: "Clips",
      icon: SquarePlay,
    },
    {
      id: "6",
      name: "Samples",
      icon: FileMusic,
    },
    {
      id: "7",
      name: "Drums",
      icon: Drum,
    },
  ];

  return (
    <div
      className={cn("h-full overflow-hidden border border-border", className)}
    >
      <ScrollArea className="h-full" type="scroll">
        <ScrollArea className="h-full" type="scroll">
          <Tree
            data={data}
            folderIcon={Folder}
            itemIcon={Workflow}
            className="h-full"
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <ScrollBar orientation="vertical" />
      </ScrollArea>
    </div>
  );
};
