// src/features/sampler/components/SfzImport.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { Import } from "lucide-react";
import { Button } from "@/common/shadcn/ui/button";
import { useSfzImport } from "@/features/sampler/hooks/useSfzImport";

interface SfzImportProps {
  className?: string;
}

export const SfzImport: React.FC<SfzImportProps> = ({ className }) => {
  const { loadDirectory } = useSfzImport();

  return (
    <div
      className={cn(
        "flex h-full flex-row justify-center border-2 border-dashed border-border",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <Import size={48} />
        <div className="text-center">Drop .sfz directory</div>
        <div className="my-10 text-center">Or</div>
        <Button
          variant="outline"
          size="sm"
          className="h-5 w-fit rounded-none"
          onClick={loadDirectory}
        >
          Pick directory
        </Button>
      </div>
    </div>
  );
};
