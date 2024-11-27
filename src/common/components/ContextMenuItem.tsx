// src/common/components/ContextMenuItem.tsx

import React from "react";
import { SerializableMenuItem } from "@/core/interfaces/contextMenu";

interface ContextMenuItemProps {
  item: SerializableMenuItem;
  onClick: (item: SerializableMenuItem) => void;
}

/**
 * A functional component that renders a single context menu item.
 *
 * @param props The properties for the component.
 * @param props.item The menu item to display.
 * @param props.onClick The callback function to handle item clicks.
 * @returns The rendered component.
 */
const ContextMenuItem: React.FC<ContextMenuItemProps> = React.memo(
  ({ item, onClick }) => {
    const handleClick = () => onClick(item);

    return (
      <li
        onClick={handleClick}
        className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
      >
        {item.icon && <img src={item.icon} alt="" className="h-5 w-5" />}
        <span>{item.label}</span>
      </li>
    );
  },
);

export default ContextMenuItem;
