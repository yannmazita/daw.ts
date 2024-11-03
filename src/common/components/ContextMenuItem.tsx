// src/common/components/ContextMenuItem.tsx

import React from 'react';
import { ContextMenuItem as MenuItem } from '../models/ContextMenuItem';

interface ContextMenuItemProps {
  item: MenuItem;
  onClick: (item: MenuItem) => void;
}

const ContextMenuItem: React.FC<ContextMenuItemProps> = React.memo(({ item, onClick }) => {
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
});

export default ContextMenuItem;
