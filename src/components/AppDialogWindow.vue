<template>
    <div v-for="(dialog, index) in dialogs" :key="index">
        <div ref="dialogWindow" v-if="dialog.visible" id="dialog-window-container" :style="getStyle(dialog)"
            class="fixed z-40 bg-white w-3/6 h-2/6 p-2 flex flex-col">
            <AppTitleBar @close="() => handleClose(dialog.id)" :title="dialog.title" />
            <div class="pt-2 h-full w-full grid grid-cols-3">
                <div id="dialog-window-list-container" class="col-span-1 border border-ts-blue mr-1">
                    <ul>
                        <li v-for="(item, itemIndex) in dialog.items" :key="itemIndex" @click="item.performAction()"
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
    </div>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialogStore';
import AppTitleBar from '@/components/AppTitleBar.vue';
import { DialogInstance } from '@/utils/interfaces';

const { dialogs, closeDialog } = useDialogStore();

function getStyle(dialog: DialogInstance) {
    return dialog.centered ? {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
    } : {
        top: `${dialog.yPos}px`,
        left: `${dialog.xPos}px`
    };
}

function handleClose(id: string) {
    closeDialog(id);
}
</script>
