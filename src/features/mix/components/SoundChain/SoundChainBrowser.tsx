// src/features/mix/components/SoundChain/SoundChainBrowser.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { useSoundChainOperations } from "../../hooks/useSoundChainOperations";

interface SoundChainBrowserProps {
  className?: string;
}

export const SoundChainBrowser: React.FC<SoundChainBrowserProps> = ({
  className,
}) => {
  const { tracksWithSoundChains } = useSoundChainOperations();
  return (
    <div className={cn("", className)}>
      <ul>
        {tracksWithSoundChains.map((track) => (
          <li key={track.id}>{track.name}</li>
        ))}
      </ul>
    </div>
  );
};
