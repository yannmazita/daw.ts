// src/common/components/Toolbar/ViewSelector.tsx
import { Button } from "@/common/shadcn/ui/button";
import { ViewType } from "@/core/types/common";
import { useViewStore } from "@/core/stores/useViewStore";
import { Grid, Layout } from "lucide-react";

export const ViewSelector = () => {
  const { currentView, setView } = useViewStore();

  return (
    <div className="flex gap-1">
      <Button
        variant={currentView === ViewType.NOTHING ? "default" : "ghost"}
        size="sm"
        onClick={() => setView(ViewType.NOTHING)}
      >
        <Layout className="mr-2 h-4 w-4" />
        Arrange
      </Button>
      <Button
        variant={currentView === ViewType.NOTHING ? "default" : "ghost"}
        size="sm"
        onClick={() => setView(ViewType.NOTHING)}
      >
        <Grid className="mr-2 h-4 w-4" />
        nothing
      </Button>
    </div>
  );
};
