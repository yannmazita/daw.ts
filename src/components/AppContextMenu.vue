<template>
    <div v-if="menu.visible" :style="styleObject" class="fixed z-50 bg-white shadow-lg border-gray-200 border p-2"
        v-click-outside="menu.closeContextMenu">
        <ul>
            <li v-for="(item, index) in menu.items" :key="index" @click="item.performAction()"
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

const menu = useContextMenuStore();


// Using tailwind classes to dynamically set arbitrary position values is annoying
const styleObject = computed(() => ({
    top: `${menu.yPos}px`,
    left: `${menu.xPos}px`,
}));
</script>
