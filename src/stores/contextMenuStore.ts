// File: contextMenuStore.ts
// Description: Manages the state of context menus throughout the application using Pinia.

import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';

/**
 * A store for managing context menus across the application.
 */
export const useContextMenuStore = defineStore('contextMenu', () => {
    const items: Ref<AppContextMenuItem[]> = ref([]);
    const visible: Ref<boolean> = ref(false);
    const xPos: Ref<number> = ref(0);
    const yPos: Ref<number> = ref(0);

    /**
     * Opens a context menu at specified coordinates with given items.
     * @param menuItems Array of context menu items to display.
     * @param x The x-coordinate for the context menu position.
     * @param y The y-coordinate for the context menu position.
     */
    function openContextMenu(menuItems: AppContextMenuItem[], x: number, y: number) {
        visible.value = true;
        items.value = menuItems;
        xPos.value = x;
        yPos.value = y;
    }

    /**
     * Closes the currently visible context menu.
     */
    function closeContextMenu() {
        visible.value = false;
    }

    return {
        items,
        visible,
        xPos,
        yPos,
        openContextMenu,
        closeContextMenu,
    };
});
