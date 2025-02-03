// src/features/sampler/components/SamplerSheet.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { SfzImport } from "./SfzImport";
import { SampleManagement } from "./SampleManagement";

interface SamplerSheetProps {
  className?: string;
}

export const SamplerSheet: React.FC<SamplerSheetProps> = ({ className }) => {
  return (
    <div className={cn("flex h-full flex-row", className)}>
      <SfzImport />
      <SampleManagement className="flex-1" />
    </div>
  );
};
