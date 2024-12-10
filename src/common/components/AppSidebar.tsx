// src/common/components/AppSidebar.tsx
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
} from "@/common/shadcn/ui/sidebar";
import { PatternList } from "@/features/patterns/components/PatternList";

export const AppSidebar: React.FC = () => {
  return (
    <Sidebar>
      <SidebarHeader className="flex h-14 items-center border-b border-border px-4">
        <h2 className="font-semibold">Browser</h2>
      </SidebarHeader>
      <SidebarContent>
        <PatternList />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
};
