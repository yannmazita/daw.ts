// src/features/sampler/components/SampleManagement.tsx
import { cn } from "@/common/shadcn/lib/utils";
import { useSampleManagement } from "../hooks/useSampleManagement";
import { DataTable } from "@/common/components/DataTable";
import { sfzColumns } from "./SfzFiles/sfzColumns";

interface SampleManagementProps {
  className?: string;
}

export const SampleManagement: React.FC<SampleManagementProps> = ({
  className,
}) => {
  const { sfzFiles } = useSampleManagement();

  return (
    <div className={cn("flex h-full flex-col px-4", className)}>
      <DataTable key={sfzFiles.length} columns={sfzColumns} data={sfzFiles} />
    </div>
  );
};
