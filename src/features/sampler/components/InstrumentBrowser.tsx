// src/features/sampler/components/InstrumentBrowser.tsx
import { Button } from "@/common/shadcn/ui/button";
import { Input } from "@/common/shadcn/ui/input";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useInstrumentBrowser } from "../hooks/useInstrumentBrowser";

export const InstrumentBrowser: React.FC = () => {
  const { instruments, loadInstrument } = useInstrumentBrowser();
  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >();

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
  };

  return (
    <div className="flex flex-col border border-border p-2">
      <div className="flex flex-col">
        <h2 className="text-lg font-semibold">Instruments</h2>
        <Button variant="outline" size="sm" onClick={loadInstrument}>
          Load Instruments
        </Button>
      </div>
      <div className="mt-4">
        {Object.entries(instruments).length > 0 ? (
          <Select
            value={selectedInstrument}
            onValueChange={handleInstrumentChange}
          >
            <SelectTrigger
              className="h-7 w-full rounded-none py-1 text-left"
              aria-label="Instrument"
            >
              <SelectValue placeholder="Select Instrument" />
            </SelectTrigger>
            <SelectContent className="rounded-none">
              {Object.entries(instruments).map(([id, instrument]) => (
                <SelectItem key={id} value={id}>
                  {instrument.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-muted-foreground">No instruments loaded</p>
        )}
      </div>
    </div>
  );
};
