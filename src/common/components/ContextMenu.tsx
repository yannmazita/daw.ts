import React, { useRef, useCallback, useMemo, useLayoutEffect } from 'react';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { closeContextMenu } from '../slices/contextMenuSlice';
import { RootState } from '@/store';
import { AppContextMenuItem } from '../models/AppContextMenuItem';
import { useClickOutside } from '../hooks/useClickOutside';

const AppContextMenu: React.FC = React.memo(() => {
  const dispatch = useDispatch();
  const menu = useSelector((state: RootState) => state.contextMenu, shallowEqual);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Close the context menu when clicking outside of it
  useClickOutside(contextMenuRef, useCallback(() => dispatch(closeContextMenu()), [dispatch]));

  // Memoize the style object to avoid recalculating on every render
  const styleObject = useMemo(() => ({
    top: `${menu.yPos}px`,
    left: `${menu.xPos}px`,
  }), [menu.yPos, menu.xPos]);

  // Memoize the item click handler
  const handleItemClick = useCallback((item: AppContextMenuItem) => {
    item.performAction();
    dispatch(closeContextMenu());
  }, [dispatch]);

  // Memoize app-level and contextual items
  const appLevelItems = useMemo(() => Object.values(menu.appLevelItems), [menu.appLevelItems]);
  const contextualItemGroups = useMemo(() => Object.entries(menu.contextualItems), [menu.contextualItems]);

  // Layout effect to update position instantly upon mount
  useLayoutEffect(() => {
    if (contextMenuRef.current) {
      const menuBounds = contextMenuRef.current.getBoundingClientRect();
      // Adjust position if menu overflows
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
          <li
            key={`app-${index}`}
            onClick={() => handleItemClick(item)}
            className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
          >
            {item.icon && <img src={item.icon} alt="" className="h-5 w-5" />}
            <span>{item.label}</span>
          </li>
        ))}

        {/* Render grouped contextual items */}
        {contextualItemGroups.map(([groupId, items], groupIndex) => (
          <React.Fragment key={`group-${groupId}`}>
            {(groupIndex > 0 || appLevelItems.length > 0) && <hr className="my-2" />}
            {items.map((item, itemIndex) => (
              <li
                key={`context-${groupId}-${itemIndex}`}
                onClick={() => handleItemClick(item)}
                className="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100"
              >
                {item.icon && <img src={item.icon} alt="" className="h-5 w-5" />}
                <span>{item.label}</span>
              </li>
            ))}
          </React.Fragment>
        ))}
      </ul>
    </div>
  );
});

export default AppContextMenu;
