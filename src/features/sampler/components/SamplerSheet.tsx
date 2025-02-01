// src/features/sampler/components/SamplerSheet.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { SfzImport } from "./SfzImport";
import { SampleManagement } from "./SampleManagement";

interface SamplerSheetProps {
  className?: string;
}

export const SamplerSheet: React.FC<SamplerSheetProps> = ({ className }) => {
  return (
    <div className={cn("grid h-full grid-cols-12", className)}>
      <div className="col-span-1">
        <SfzImport />
      </div>
      <div className="col-span-11">
        <SampleManagement />
      </div>
    </div>
  );
};
