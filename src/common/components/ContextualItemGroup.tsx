// src/common/components/ContextualItemGroup.tsx

import React from 'react';
import ContextMenuItem from './ContextMenuItem';
import { ContextMenuItem as MenuItem } from '../models/ContextMenuItem';

interface ContextualItemGroupProps {
  groupId: string;
  items: MenuItem[];
  onItemClick: (item: MenuItem) => void;
  showSeparator: boolean;
}

const ContextualItemGroup: React.FC<ContextualItemGroupProps> = React.memo(
  ({ items, onItemClick, showSeparator }) => (
    <>
      {showSeparator && <hr className="my-2" />}
      {items.map((item, index) => (
        <ContextMenuItem key={`context-${index}`} item={item} onClick={onItemClick} />
      ))}
    </>
  )
);

export default ContextualItemGroup;
