// src/features/sampler/components/SfzImport.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { Import } from "lucide-react";
import { Button } from "@/common/shadcn/ui/button";

interface SfzImportProps {
  className?: string;
}

export const SfzImport: React.FC<SfzImportProps> = ({ className }) => {
  return (
    <div
      className={cn(
        "flex h-full flex-row justify-center border-2 border-dashed border-border",
        className,
      )}
    >
      <div className="flex flex-col items-center justify-center">
        <Import size={48} />
        <div>Drop .sfz</div>
        <Button
          variant="outline"
          size="sm"
          className="mt-20 h-5 w-fit rounded-none"
        >
          Browse files
        </Button>
      </div>
    </div>
  );
};
