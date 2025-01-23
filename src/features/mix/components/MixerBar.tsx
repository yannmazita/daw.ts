// src/features/mix/components/MixerBar.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useSoundChainOperations } from "../hooks/useSoundChainOperations";
import { useUIStore } from "@/core/stores/useUIStore";
import { useSoundChain } from "../hooks/useSoundChain";

export const MixerBar: React.FC = () => {
  const { createSoundChain } = useSoundChainOperations();
  const { clickedComponentId } = useUIStore();
  const { soundChain } = useSoundChain(clickedComponentId ?? "");

  const handleCreateSoundChain = () => {
    if (!soundChain || !clickedComponentId) return;
    createSoundChain(clickedComponentId);
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
