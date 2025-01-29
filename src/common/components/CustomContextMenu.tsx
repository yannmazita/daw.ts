// src/common/components/CustomContextMenu.tsx
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/common/shadcn/ui/context-menu";
import {
  ContextMenuItem as TContextMenuItem,
  ContextMenuProps,
} from "@/common/types";

export function CustomContextMenu({
  baseItems = [],
  additionalItems = [],
  children,
}: ContextMenuProps) {
  const allItems = [...additionalItems, ...baseItems];

  const renderMenuItem = (item: TContextMenuItem) => {
    switch (item.type) {
      case "item":
        return (
          <ContextMenuItem
            key={item.id}
            disabled={item.disabled}
            onClick={item.onClick}
          >
            {item.icon && <item.icon className="mr-2 h-4 w-4" />}
            {item.label}
          </ContextMenuItem>
        );
      case "separator":
        return <ContextMenuSeparator key={item.id} />;
      case "label":
        return (
          <ContextMenuItem key={item.id} disabled>
            {item.label}
          </ContextMenuItem>
        );
      case "section":
        return (
          <ContextMenuSub key={item.id}>
            <ContextMenuSubTrigger>{item.label}</ContextMenuSubTrigger>
            <ContextMenuSubContent>
              {item.items.map(renderMenuItem)}
            </ContextMenuSubContent>
          </ContextMenuSub>
        );
    }
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>{children}</ContextMenuTrigger>
      <ContextMenuContent>{allItems.map(renderMenuItem)}</ContextMenuContent>
    </ContextMenu>
  );
}
