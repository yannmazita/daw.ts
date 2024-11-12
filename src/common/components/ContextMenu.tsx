// src/common/components/ContextMenu.tsx

import React, { useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeContextMenu } from '../slices/contextMenuSlice';
import { RootState } from '@/store';
import { SerializableMenuItem } from '@/core/interfaces/contextMenu';
import { useClickOutside } from '../hooks/useClickOutside';
import ContextMenuItem from './ContextMenuItem';
import ContextualItemGroup from './ContextualItemGroup';

/**
 * A functional component that renders a context menu.
 * 
 * @returns {JSX.Element | null} - The rendered component or null if the menu is not visible.
 */
const ContextMenu: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const menu = useSelector((state: RootState) => state.contextMenu, shallowEqual);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close the context menu when clicking outside of it
  useClickOutside(contextMenuRef, useCallback(() => dispatch(closeContextMenu()), [dispatch]));

  // Memoize style object for position
  const styleObject = useMemo(() => ({
    top: `${menu.yPos}px`,
    left: `${menu.xPos}px`,
  }), [menu.yPos, menu.xPos]);

  const handleItemClick = useCallback((item: SerializableMenuItem) => {
    dispatch({ type: 'EXECUTE_CONTEXT_MENU_ITEM', payload: item });
    dispatch(closeContextMenu());
  }, [dispatch]);

  const appLevelItems = useMemo(() => Object.values(menu.appLevelItems), [menu.appLevelItems]);
  const contextualItemGroups = useMemo(() => Object.entries(menu.contextualItems), [menu.contextualItems]);

  // Layout effect to adjust menu position
  useLayoutEffect(() => {
    if (contextMenuRef.current) {
      const menuBounds = contextMenuRef.current.getBoundingClientRect();
      if (menuBounds.right > window.innerWidth) {
        contextMenuRef.current.style.left = `${window.innerWidth - menuBounds.width}px`;
      }
      if (menuBounds.bottom > window.innerHeight) {
        contextMenuRef.current.style.top = `${window.innerHeight - menuBounds.height}px`;
      }
    }
  }, [styleObject]);

  if (!menu.visible) return null;

  return (
    <div
      ref={contextMenuRef}
      id="app-context-menu-container"
      style={styleObject}
      className="fixed z-[1000000] bg-white shadow-lg border-gray-200 border p-2"
    >
      <ul>
        {/* Render app-level items */}
        {appLevelItems.map((item, index) => (
          <ContextMenuItem key={`app-${index}`} item={item} onClick={handleItemClick} />
        ))}

        {/* Render contextual item groups */}
        {contextualItemGroups.map(([groupId, items], groupIndex) => (
          <ContextualItemGroup
            key={`group-${groupId}`}
            groupId={groupId}
            items={items}
            onItemClick={handleItemClick}
            showSeparator={groupIndex > 0 || appLevelItems.length > 0}
          />
        ))}
      </ul>
    </div>
  );
});

export default ContextMenu;
