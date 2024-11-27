// src/common/components/ContextMenu.tsx

import React, { useRef, useMemo, useCallback, useLayoutEffect } from "react";
import { SerializableMenuItem } from "@/core/interfaces/contextMenu";
import { useClickOutside } from "../hooks/useClickOutside";
import ContextMenuItem from "./ContextMenuItem";
import ContextualItemGroup from "./ContextualItemGroup";
import { useContextMenuStore } from "../slices/useContextMenuStore";

const ContextMenu: React.FC = React.memo(() => {
  const {
    visible,
    xPos,
    yPos,
    appLevelItems,
    contextualItems,
    closeContextMenu,
  } = useContextMenuStore();
  const contextMenuRef = useRef<HTMLDivElement>(null);

  useClickOutside(
    contextMenuRef,
    useCallback(() => closeContextMenu(), [closeContextMenu]),
  );

  const styleObject = useMemo(
    () => ({ top: `${yPos}px`, left: `${xPos}px` }),
    [yPos, xPos],
  );

  const handleItemClick = useCallback(
    (item: SerializableMenuItem) => {
      // actually do something
      closeContextMenu();
    },
    [closeContextMenu],
  );

  const appLevelItemsList = useMemo(
    () => Object.values(appLevelItems),
    [appLevelItems],
  );
  const contextualItemGroups = useMemo(
    () => Object.entries(contextualItems),
    [contextualItems],
  );

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

  if (!visible) return null;

  return (
    <div
      ref={contextMenuRef}
      id="app-context-menu-container"
      style={styleObject}
      className="fixed z-[1000000] bg-white shadow-lg border-gray-200 border p-2"
    >
      <ul>
        {appLevelItemsList.map((item, index) => (
          <ContextMenuItem
            key={`app-${index}`}
            item={item}
            onClick={handleItemClick}
          />
        ))}
        {contextualItemGroups.map(([groupId, items], groupIndex) => (
          <ContextualItemGroup
            key={`group-${groupId}`}
            groupId={groupId}
            items={items}
            onItemClick={handleItemClick}
            showSeparator={groupIndex > 0 || appLevelItemsList.length > 0}
          />
        ))}
      </ul>
    </div>
  );
});

export default ContextMenu;
