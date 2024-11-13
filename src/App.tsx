// src/App.tsx

import React, { useEffect } from 'react';
import { useContextMenuStore } from './common/slices/useContextMenuStore';
import { SerializableMenuItem } from '@/core/interfaces/contextMenu';
import ContextMenu from './common/components/ContextMenu';
import MainView from './views/MainView';

/**
 * The main application component.
 * 
 * @returns The rendered component.
 */
const App: React.FC = () => {
  const menuVisible = useContextMenuStore(state => state.visible);
  const setAppLevelItems = useContextMenuStore(state => state.setAppLevelItems);
  const openContextMenu = useContextMenuStore(state => state.openContextMenu);

  useEffect(() => {
    const appItems: Record<string, SerializableMenuItem> = {
      settings: {
        id: 'settings',
        label: 'Settings',
        icon: '/icons/settings.png',
        actionType: 'OPEN_SETTINGS',
        commandType: 'OpenSettingsCommand',
        payload: { settingsType: 'general' }
      },
      help: {
        id: 'help',
        label: 'Help',
        icon: '/icons/help.png',
        actionType: 'OPEN_HELP',
        commandType: 'OpenHelpCommand',
        payload: { helpSection: 'getting-started' }
      },
    };

    setAppLevelItems(appItems);
  }, []);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    openContextMenu(e.clientX, e.clientY);
  };

  return (
    <>
      <div className="h-screen w-full" onContextMenu={handleContextMenu}>
        {menuVisible && <ContextMenu />}
        <MainView />
      </div>
    </>
  );
};

export default App;
