<template>
    <div v-if="dialog.visible" ref="dialogWindow" id="dialog-window-container" :style="styleObject" class="fixed z-40">
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
import { computed, onMounted, nextTick, ref } from 'vue';

const dialog = useDialogStore();
const dialogWindow = ref(null);

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
