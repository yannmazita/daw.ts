// src/common/components/Workspace/Workspace.tsx
import { ViewType } from "@/core/types/common";
import { useViewStore } from "@/common/slices/useViewStore";
import { SessionView } from "@/features/session/components/SessionView";
import { ArrangementView } from "@/features/arrangement/components/ArrangementView";

export const Workspace: React.FC = () => {
  const currentView = useViewStore((state) => state.currentView);

  return (
    <div className="flex-1 overflow-hidden">
      {currentView === ViewType.ARRANGEMENT ? (
        <ArrangementView />
      ) : (
        <SessionView />
      )}
    </div>
  );
};
