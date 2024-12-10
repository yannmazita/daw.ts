// src/features/patterns/components/PatternList.tsx

import { useCallback, useState } from "react";
import { useStore } from "@/common/slices/useStore";
import { PatternListItem } from "./PatternListItem";
import { CreatePatternDialog } from "./CreatePatternDialog";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/common/shadcn/ui/sidebar";
import { Music2 } from "lucide-react";
import { DeletePatternDialog } from "./DeletePatternDialog";

export const PatternList = () => {
  const {
    createPattern,
    deletePattern,
    duplicatePattern,
    setCurrentPattern,
    updatePattern,
  } = useStore();
  const patterns = useStore((state) => state.patterns);
  const currentPatternId = useStore((state) => state.currentPatternId);
  const [patternIdToDelete, setPatternIdToDelete] = useState("");

  const handleCreatePattern = useCallback(
    (name: string, timeSignature: [number, number]) => {
      const id = createPattern(name, timeSignature);
      setCurrentPattern(id);
    },
    [createPattern, setCurrentPattern],
  );

  const handleDeletePattern = useCallback((id: string) => {
    setPatternIdToDelete(id);
  }, []);
  const handleConfirmDelete = useCallback(() => {
    if (patternIdToDelete) {
      deletePattern(patternIdToDelete);
    }
    setPatternIdToDelete("");
  }, [deletePattern, patternIdToDelete]);

  const handleRename = useCallback(
    (id: string, newName: string) => {
      const pattern = patterns.find((p) => p.id === id);
      if (pattern) {
        updatePattern(id, { ...pattern, name: newName });
      }
    },
    [patterns, updatePattern],
  );

  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-sidebar-foreground/70">
        <Music2 className="mr-2" />
        Patterns
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-1">
          <CreatePatternDialog onCreatePattern={handleCreatePattern} />
          <DeletePatternDialog
            patternId={patternIdToDelete}
            isOpen={patternIdToDelete !== null}
            onClose={() => setPatternIdToDelete("")}
            onConfirm={handleConfirmDelete}
          />
          {patterns.length === 0 ? (
            <div className="px-2 py-1.5 text-center text-xs text-sidebar-foreground/50">
              No patterns created
            </div>
          ) : (
            patterns.map((pattern) => (
              <PatternListItem
                key={pattern.id}
                pattern={pattern}
                isSelected={pattern.id === currentPatternId}
                onSelect={setCurrentPattern}
                onDelete={handleDeletePattern}
                onDuplicate={duplicatePattern}
                onRename={handleRename}
              />
            ))
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
};
