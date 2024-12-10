// src/features/patterns/components/PatternList.tsx

import { useStore } from "@/common/slices/useStore";
import { PatternListItem } from "./PatternListItem";
import { CreatePatternDialog } from "./CreatePatternDialog";

export const PatternList: React.FC = () => {
  const {
    patterns,
    currentPatternId,
    createPattern,
    deletePattern,
    duplicatePattern,
    setCurrentPattern,
  } = useStore();

  const handleCreatePattern = (
    name: string,
    timeSignature: [number, number],
  ) => {
    const id = createPattern(name, timeSignature);
    setCurrentPattern(id);
  };

  return (
    <div className="w-64 border-r bg-background">
      <div className="p-4">
        <CreatePatternDialog onCreatePattern={handleCreatePattern} />
      </div>
      <div className="divide-y">
        {patterns.map((pattern) => (
          <PatternListItem
            key={pattern.id}
            pattern={pattern}
            isSelected={pattern.id === currentPatternId}
            onSelect={setCurrentPattern}
            onDelete={deletePattern}
            onDuplicate={duplicatePattern}
          />
        ))}
      </div>
    </div>
  );
};
