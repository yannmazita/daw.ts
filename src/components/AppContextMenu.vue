<template>
    <div ref="contextMenu" v-if="menu.visible" id="app-context-menu-container" :style="styleObject"
        class="fixed z-[1000000] bg-white shadow-lg border-gray-200 border p-2">
        <ul>
            <li v-for="(item, index) in menu.appLevelItems" :key="`app-${index}`" @click="handleItemClick(item as AppContextMenuItem)"
                class="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100">
                <img v-if="item.icon" :src="item.icon" alt="" class="h-5 w-5">
                <span>{{ item.label }}</span>
            </li>
            <template v-for="(group, groupIndex) in menu.contextualItems" :key="`group-${groupIndex}`">
                <hr v-if="groupIndex > 0 || menu.appLevelItems.length > 0" class="my-2">
                <li v-for="(item, itemIndex) in group" :key="`context-${groupIndex}-${itemIndex}`"
                    @click="handleItemClick(item as AppContextMenuItem)"
                    class="flex items-center space-x-2 p-2 cursor-pointer hover:bg-gray-100">
                    <img v-if="item.icon" :src="item.icon" alt="" class="h-5 w-5">
                    <span>{{ item.label }}</span>
                </li>
            </template>
        </ul>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useContextMenuStore } from '@/stores/contextMenuStore';
import { AppContextMenuItem } from '@/models/AppContextMenuItem';
import { onClickOutside } from '@vueuse/core';
import { ref, Ref } from 'vue';

const menu = useContextMenuStore();
const contextMenu: Ref<HTMLElement | null> = ref(null);

onClickOutside(contextMenu, () => {
    menu.closeContextMenu();
});

const styleObject = computed(() => ({
    top: `${menu.yPos}px`,
    left: `${menu.xPos}px`,
}));

function handleItemClick(item: AppContextMenuItem) {
    item.performAction();
    menu.closeContextMenu();
}
</script>
