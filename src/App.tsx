// src/App.tsx

import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { openContextMenu, setAppLevelItems, selectContextMenuVisibility } from './common/slices/contextMenuSlice';
import { SerializableMenuItem } from '@/core/interfaces/contextMenu';
import ContextMenu from './common/components/ContextMenu';
import MainView from './views/MainView';

/**
 * The main application component.
 * 
 * @returns The rendered component.
 */
const App: React.FC = () => {
  const dispatch = useDispatch();
  const menuVisible = useSelector(selectContextMenuVisibility);

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

    dispatch(setAppLevelItems(appItems));
  }, [dispatch]);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    dispatch(openContextMenu({ x: e.clientX, y: e.clientY }));
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
