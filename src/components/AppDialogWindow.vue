<template>
    <!-- Multi-Dialog Container -->
    <!-- Iterates over multiple dialog instances and renders each one based on visibility and context. -->
    <div v-for="(dialog, index) in dialogs" :key="index" @click="setActiveDialog(dialog.id)">
        <div ref="dialogWindow" v-if="dialog.visible" id="dialog-window-container"
            :style="getStyle(dialog as DialogInstance)" class="fixed z-40 bg-white w-3/6 h-2/6 p-2 flex flex-col">
            <!-- Dialog Title Bar -->
            <!-- Includes a close button which triggers the handleClose function. -->
            <AppTitleBar @close="() => handleClose(dialog.id)" :title="dialog.title" />
            <!-- Dialog Content Area -->
            <!-- Divided into a list section for menu items and a content display area. -->
            <div class="pt-2 h-full w-full grid grid-cols-3">
                <!-- Dialog Menu Items -->
                <!-- List of interactive items, each item can trigger an action on click. -->
                <div id="dialog-window-list-container" class="col-span-1 border border-ts-blue mr-1">
                    <ul>
                        <li v-for="(item, itemIndex) in dialog.items" :key="itemIndex" @click="item.performAction()"
                            class="cursor-pointer hover:bg-gray-100">
                            {{ item.label }}
                        </li>
                    </ul>
                </div>
                <!-- Active Component Display -->
                <!-- Dynamically rendered component based on the active component specified in the dialog's context. -->
                <div id="dialog-window-content-container" class="col-span-2 border border-ts-blue ml-1">
                    <component :is="dialog.activeComponent" :context="dialog.context"></component>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useDialogStore } from '@/stores/dialogStore';
import AppTitleBar from '@/components/AppTitleBar.vue';
import { DialogInstance } from '@/utils/interfaces';

const { dialogs, setActiveDialog, closeDialog } = useDialogStore();

// Calculates the CSS styles for positioning each dialog based on whether it is centered.
function getStyle(dialog: DialogInstance) {
    if (dialog.centered) {
        // Calculate offsets based on dialog's position relative to the exact center.
        const offsetX = dialog.xPos - window.innerWidth / 2;
        const offsetY = dialog.yPos - window.innerHeight / 2;

        return {
            top: '50%',
            left: '50%',
            // Combine translation values for the offset
            transform: `translate(calc(-50% + ${offsetX}px), calc(-50% + ${offsetY}px))`,
            zIndex: dialog.zIndex
        };
    } else {
        return {
            top: `${dialog.yPos}px`,
            left: `${dialog.xPos}px`
        };
    }
}

// Closes the dialog with the given id.
function handleClose(id: string) {
    closeDialog(id);
}
</script>
