// src/common/components/AppSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger,
} from "@/common/shadcn/ui/sidebar";
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
      <SidebarContent />
      <SidebarFooter />
    </Sidebar>
  );
};
