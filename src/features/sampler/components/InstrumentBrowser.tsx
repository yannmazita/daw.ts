// src/features/sampler/components/InstrumentBrowser.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useCallback, useRef, useState } from "react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >();

  const handleLoadSFZ = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        await loadInstrument(file);
      } catch (error) {
        console.error("Error loading SFZ:", error);
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    },
    [loadInstrument],
  );

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
  };

  return (
    <div className="flex flex-col border border-border p-2">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Instruments</h2>
        <Button variant="outline" size="sm" onClick={handleLoadSFZ}>
          Load SFZ
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
      <input
        type="file"
        accept=".sfz"
        style={{ display: "none" }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
    </div>
  );
};
