import { defineStore } from 'pinia';
import { Component, Ref, ref } from 'vue';
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';

export const useDialogStore = defineStore('dialog', () => {
    const items = ref<AppDialogWindowItem[]>([]);
    const visible = ref(false);
    const activeComponent: Ref<Component | null> = ref(null);
    const xPos = ref(0);
    const yPos = ref(0);
    const centered = ref(false);

    function setActiveComponent(component: Component): void {
        activeComponent.value = component;
    }

    function setAdjustedPosition(x: number, y: number) {
        xPos.value = x;
        yPos.value = y;
    }

    function openDialog(dialogItems: AppDialogWindowItem[], x: number, y: number, shouldBeCentered: boolean) {
        items.value = dialogItems;
        centered.value = shouldBeCentered;
        visible.value = true;
        if (!shouldBeCentered) {
            xPos.value = x;
            yPos.value = y;
        } else {
            // Will be adjusted after rendering
            xPos.value = x;
            yPos.value = y;
        }
    }

    function closeDialog() {
        visible.value = false;
        centered.value = false;
    }

    return {
        items,
        visible,
        activeComponent,
        xPos,
        yPos,
        centered,
        setActiveComponent,
        setAdjustedPosition,
        openDialog,
        closeDialog
    };
});
