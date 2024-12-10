// src/common/components/AppSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/common/shadcn/ui/sidebar";
import { PatternList } from "@/features/patterns/components/PatternList";
import { useSidebar } from "@/common/shadcn/ui/sidebar";

export const AppSidebar: React.FC = () => {
  const { state } = useSidebar();
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="flex h-14 flex-row items-center border-b border-border px-4">
        {state === "collapsed" ? (
          <>
            <SidebarTrigger />
          </>
        ) : (
          <>
            <SidebarTrigger />
            <h2 className="font-semibold">Browser</h2>
          </>
        )}
      </SidebarHeader>
      <SidebarContent>
        <PatternList />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
