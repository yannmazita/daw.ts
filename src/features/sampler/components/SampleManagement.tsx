// src/features/mix/components/Sample/SampleManagement.tsx
import { cn } from "@/common/shadcn/lib/utils";

interface SampleManagementProps {
  className?: string;
}

export const SampleManagement: React.FC<SampleManagementProps> = ({
  className,
}) => {
  return <div className={cn("h-full", className)}></div>;
};
