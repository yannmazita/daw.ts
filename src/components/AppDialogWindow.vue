<template>
    <div ref="dialogwindow" v-if="dialog.visible" id="dialog-window-container" :style="styleObject" class="fixed z-40">
        <div id="dialog-window-list-container">
            <ul>
                <li v-for="(item, index) in dialog.items" :key="index" @click="item.performAction()"
                    class="cursor-pointer">
                    {{ item.label }}
                </li>
            </ul>
        </div>
        <div class="dialog-window-content-container">
            <component :is="dialog.activeComponent"></component>
        </div>
    </div>
</template>

<script setup>
import { useDialogStore } from '@/stores/dialogStore';
import { computed, nextTick, watch, onMounted } from 'vue';

const dialog = useDialogStore();

const styleObject = computed(() => {
    return {
        top: `${dialog.yPos}px`,
        left: `${dialog.xPos}px`,
    };
});

onMounted(() => {
    dialog.adjustDialogPosition("dialog-window-container");
});
</script>
