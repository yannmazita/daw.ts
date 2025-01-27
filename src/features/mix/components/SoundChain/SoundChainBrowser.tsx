// src/features/mix/components/SoundChain/SoundChainBrowser.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { useTrack } from "../../hooks/useTrack";
import { useTrackOperations } from "../../hooks/useTrackOperations";
import { useSoundChain } from "../../hooks/useSoundChain";
import { useSoundChainOperations } from "../../hooks/useSoundChainOperations";

interface SoundChainBrowserProps {
  className?: string;
}

export const SoundChainBrowser: React.FC<SoundChainBrowserProps> = ({
  className,
}) => {
  return <div className={cn("", className)}></div>;
};
