// src/features/sampler/components/InstrumentBrowser.tsx
import { Button } from "@/common/shadcn/ui/button";
import { useInstrumentBrowser } from "../hooks/useInstrumentBrowser";
import { InstrumentsTree } from "./InstrumentsTree";

export const InstrumentBrowser: React.FC = () => {
  const { filesTree, filesMap, loadInstrument } = useInstrumentBrowser();

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
