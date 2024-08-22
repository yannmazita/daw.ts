<template>
    <div v-if="dialog.visible" id="dialog-window-container"
        :style="dialog.centered ? styleObjectCentered : styleObjectNotCentered" class="fixed z-50">
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
<script setup lang="ts">
import { useDialogStore } from '@/stores/dialogStore';
import { computed, } from 'vue';

const dialog = useDialogStore();

const styleObjectNotCentered = computed(() => ({
    top: `${dialog.yPos}px`,
    left: `${dialog.xPos}px`,
}));

const styleObjectCentered = computed(() => ({
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
}));
</script>
