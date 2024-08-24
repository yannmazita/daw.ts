<template>
    <div ref="dialogWindow" v-if="dialog.visible" id="dialog-window-container" :style="styleObject"
        class="fixed z-40 bg-white w-3/6 h-2/6 p-2 flex flex-col">
        <AppTitleBar @close="handleClose()" :title="dialog.title" class=""></AppTitleBar>
        <div class="pt-2 h-full w-full grid grid-cols-3">
            <div id="dialog-window-list-container" class="col-span-1 border border-ts-blue mr-1">
                <ul>
                    <li v-for="(item, index) in dialog.items" :key="index" @click="item.performAction()"
                        class="cursor-pointer hover:bg-gray-100">
                        {{ item.label }}
                    </li>
                </ul>
            </div>
            <div id="dialog-window-content-container" class="col-span-2 border border-ts-blue ml-1">
                <component :is="dialog.activeComponent"></component>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialogStore';
import { computed, onMounted, nextTick, ref, Ref } from 'vue';
import AppTitleBar from '@/components/AppTitleBar.vue';

const dialog = useDialogStore();
const dialogWindow: Ref<HTMLElement | null> = ref(null);

const styleObject = computed(() => {
    if (dialog.visible && dialog.centered) {
        // Initial style for centered, might be adjusted
        return {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    } else {
        return {
            top: `${dialog.yPos}px`,
            left: `${dialog.xPos}px`
        };
    }
});

function handleClose(): void {
    dialog.closeDialog();
}

onMounted(() => {
    if (dialog.centered) {
        nextTick(() => {
            if (dialogWindow.value) {
                const rect = dialogWindow.value.getBoundingClientRect();
                dialog.setAdjustedPosition(window.innerWidth / 2 - rect.width / 2, window.innerHeight / 2 - rect.height / 2);
            }
        });
    }
});
</script>
