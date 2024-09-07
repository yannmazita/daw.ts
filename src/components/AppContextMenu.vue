<template>
    <div ref="contextMenu" v-if="menu.visible" id="app-context-menu-container" :style="styleObject"
        class="fixed z-[1000000] bg-white shadow-lg border-gray-200 border p-2">
        <ul>
            <li v-for="(item, index) in menu.items" :key="index" @click="handleItemClick(item as AppContextMenuItem)"
                class="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100">
                <img v-if="item.icon" :src="item.icon" alt="" class="h-5 w-5">
                <span>{{ item.label }}</span>
            </li>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { onClickOutside } from '@vueuse/core';
import { ref, Ref } from 'vue';

// Context menu state and reference to the menu element.
const menu = useContextMenuStore();
const contextMenu: Ref<HTMLElement | null> = ref(null);

// Use onClickOutside from VueUse to close the context menu when clicking outside of it.
onClickOutside(contextMenu, () => {
    menu.closeContextMenu();
});

// Compute the style object for positioning the context menu based on store values.
const styleObject = computed(() => ({
    top: `${menu.yPos}px`, // Vertical position from the store.
    left: `${menu.xPos}px`, // Horizontal position from the store.
}));

// Handle clicking on a menu item by performing the action and closing the menu.
function handleItemClick(item: AppContextMenuItem) {
    item.performAction(); // Trigger the associated action.
    menu.closeContextMenu(); // Close the menu after action.
}
</script>
