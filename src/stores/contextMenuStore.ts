import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';

export const useContextMenuStore = defineStore('contextMenu', () => {
    const appLevelItems: Ref<AppContextMenuItem[]> = ref([]);
    const contextualItems: Ref<AppContextMenuItem[][]> = ref([]);
    const visible: Ref<boolean> = ref(false);
    const xPos: Ref<number> = ref(0);
    const yPos: Ref<number> = ref(0);

    function setAppLevelItems(items: AppContextMenuItem[]) {
        appLevelItems.value = items;
    }

    function addContextualItems(items: AppContextMenuItem[]) {
        contextualItems.value.push(items);
    }

    function clearContextualItems() {
        contextualItems.value = [];
    }

    function openContextMenu(x: number, y: number) {
        visible.value = true;
        xPos.value = x;
        yPos.value = y;
    }

    function closeContextMenu() {
        visible.value = false;
        clearContextualItems();
    }

    return {
        appLevelItems,
        contextualItems,
        visible,
        xPos,
        yPos,
        setAppLevelItems,
        addContextualItems,
        clearContextualItems,
        openContextMenu,
        closeContextMenu,
    };
});
