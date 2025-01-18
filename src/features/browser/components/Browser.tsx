// src/features/browser/components/Browser.tsx
import { InstrumentBrowser } from "@/features/sampler/components/InstrumentBrowser";

export const Browser: React.FC = () => {
  return (
    <div className="col-span-3 flex flex-col border border-border">
      <InstrumentBrowser />
      <div>Browser</div>
    </div>
  );
};
