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
import { useState } from "react";
import { SoundChainBrowser } from "@/features/mix/components/SoundChain/SoundChainBrowser";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/common/shadcn/ui/sheet";
import { SampleBrowser } from "@/features/mix/components/Sample/SampleBrowser";

interface BrowserProps {
  className?: string;
}

export const Browser: React.FC<BrowserProps> = ({ className }) => {
  const [isSoundChainBrowserOpen, setIsSoundChainBrowserOpen] = useState(false);
  const [isSampleBrowserOpen, setIsSampleBrowserOpen] = useState(false);

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

  const handleTreeSelectChange = (item: TreeDataItem | undefined) => {
    switch (item?.name) {
      case "Sound Chains":
        setIsSoundChainBrowserOpen(true);
        break;
      case "Samples":
        setIsSampleBrowserOpen(true);
        break;
    }
  };

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
            onSelectChange={handleTreeSelectChange}
          />
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <ScrollBar orientation="vertical" />
      </ScrollArea>

      <Sheet
        open={isSoundChainBrowserOpen}
        onOpenChange={setIsSoundChainBrowserOpen}
      >
        <SheetContent side="bottom" className="h-1/3">
          <SheetHeader>
            <SheetTitle>Sound Chains</SheetTitle>
            <SheetDescription>
              Browse and manage your sound chains here.
            </SheetDescription>
          </SheetHeader>
          <SoundChainBrowser />
        </SheetContent>
      </Sheet>

      <Sheet open={isSampleBrowserOpen} onOpenChange={setIsSampleBrowserOpen}>
        <SheetContent side="bottom" className="h-1/3">
          <SheetHeader>
            <SheetTitle>Sample Browser</SheetTitle>
            <SheetDescription>
              Browse and manage your samples here.
            </SheetDescription>
          </SheetHeader>
          <SampleBrowser />
        </SheetContent>
      </Sheet>
    </div>
  );
};
