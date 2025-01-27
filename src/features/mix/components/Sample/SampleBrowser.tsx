// src/features/mix/components/Sample/SampleBrowser.tsx
import { cn } from "@/common/shadcn/lib/utils";
interface SampleBrowserProps {
  className?: string;
}

export const SampleBrowser: React.FC<SampleBrowserProps> = ({ className }) => {
  return <div className={cn("", className)}></div>;
};
