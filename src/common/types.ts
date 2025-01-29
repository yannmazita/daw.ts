//src/common/types.ts
export type ContextMenuItemType = "item" | "separator" | "label" | "section";

export interface BaseContextMenuItem {
  id: string;
  type: ContextMenuItemType;
  disabled?: boolean;
}

export interface ContextMenuActionItem extends BaseContextMenuItem {
  type: "item";
  label: string;
  onClick: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ContextMenuSeparatorItem extends BaseContextMenuItem {
  type: "separator";
}

export interface ContextMenuLabelItem extends BaseContextMenuItem {
  type: "label";
  label: string;
}

export interface ContextMenuSectionItem extends BaseContextMenuItem {
  type: "section";
  label: string;
  items: ContextMenuItem[];
}

export type ContextMenuItem =
  | ContextMenuActionItem
  | ContextMenuSeparatorItem
  | ContextMenuLabelItem
  | ContextMenuSectionItem;

export interface ContextMenuProps {
  baseItems?: ContextMenuItem[];
  additionalItems?: ContextMenuItem[];
  children: React.ReactNode;
}
