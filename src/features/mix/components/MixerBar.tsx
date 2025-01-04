// src/features/mix/components/MixerBar.tsx

import { Button } from "@/common/shadcn/ui/button";
import { useSoundChainManager } from "../hooks/useSoundChainManager";
import { useState } from "react";

export const MixerBar: React.FC = () => {
  const [selectedSoundChain, setSelectedSoundChain] = useState<string | null>(
    null,
  );
  const { createSoundChain } = useSoundChainManager();
  const handleCreateSoundChain = () => {
    const soundChainId = createSoundChain();
    setSelectedSoundChain(soundChainId);
  };

  return (
    <div>
      <Button
        variant="outline"
        size="sm"
        onClick={handleCreateSoundChain}
        className="h-5 w-fit rounded-none bg-primary py-1 text-primary-foreground"
      >
        Create Sound Chain
      </Button>
    </div>
  );
};
