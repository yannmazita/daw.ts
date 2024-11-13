// src/common/components/ContextualItemGroup.tsx

import React from 'react';
import ContextMenuItem from './ContextMenuItem';
import { SerializableMenuItem } from '@/core/interfaces/contextMenu';

interface ContextualItemGroupProps {
  groupId: string;
  items: SerializableMenuItem[];
  onItemClick: (item: SerializableMenuItem) => void;
  showSeparator: boolean;
}

/**
 * A functional component that renders a group of context menu items.
 * 
 * @param props The properties for the component.
 * @param props.groupId The group ID
 * @param props.items The list of menu items to display.
 * @param props.onItemClick The callback function to handle item clicks.
 * @param props.showSeparator Whether to show a separator line above the items.
 * @returns The rendered component.
 */
const ContextualItemGroup: React.FC<ContextualItemGroupProps> = React.memo(
  ({ items, onItemClick, showSeparator }) => (
    <>
      {showSeparator && <hr className="my-2" />}
      {items.map((item) => (
        <ContextMenuItem key={item.id} item={item} onClick={onItemClick} />
      ))}
    </>
  )
);

export default ContextualItemGroup;
