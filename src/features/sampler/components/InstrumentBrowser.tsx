// src/features/sampler/components/InstrumentBrowser.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/shadcn/ui/select";
import { useInstrumentBrowser } from "../hooks/useInstrumentBrowser";
import { InstrumentsTree } from "./InstrumentsTree";

export const InstrumentBrowser: React.FC = () => {
  const { instruments, filesTree, filesMap, loadInstrument } =
    useInstrumentBrowser();
  const [selectedInstrument, setSelectedInstrument] = useState<
    string | undefined
  >();

  const handleInstrumentChange = (value: string) => {
    setSelectedInstrument(value);
  };

  const handleFileClick = async (content: string): Promise<void> => {
    console.log("File clicked:", content);
    // Handle file interactions
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
      <div className="mt-4">
        {Object.keys(filesTree).length > 0 ? (
          <InstrumentsTree
            root=""
            files={filesMap}
            filesTree={filesTree}
            onFileClick={handleFileClick}
          />
        ) : (
          <p className="text-muted-foreground">No files loaded</p>
        )}
      </div>
    </div>
  );
};
