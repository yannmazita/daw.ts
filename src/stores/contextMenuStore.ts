import { ref, Ref } from 'vue';
import { defineStore } from 'pinia';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';

export const useContextMenuStore = defineStore('contextMenu', () => {
    const items: Ref<AppContextMenuItem[]> = ref([]);
    const visible: Ref<boolean> = ref(false);
    const xPos: Ref<number> = ref(0);
    const yPos: Ref<number> = ref(0);

    function openContextMenu(menuItems: AppContextMenuItem[], x: number, y: number) {
        visible.value = true;
        items.value = menuItems;
        xPos.value = x;
        yPos.value = y;
    }

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
    }
});
