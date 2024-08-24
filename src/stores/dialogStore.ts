import { defineStore } from 'pinia';
import { Component, Ref, ref } from 'vue';
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';

export const useDialogStore = defineStore('dialog', () => {
    const items: Ref<AppDialogWindowItem[]> = ref([]);
    const visible: Ref<boolean> = ref(false);
    const activeComponent: Ref<Component | null> = ref(null);
    const xPos: Ref<number> = ref(0);
    const yPos: Ref<number> = ref(0);
    const centered: Ref<boolean> = ref(false);
    const title: Ref<string> = ref('');

    function setActiveComponent(component: Component): void {
        activeComponent.value = component;
    }

    function setAdjustedPosition(x: number, y: number) {
        xPos.value = x;
        yPos.value = y;
    }

    function openDialog(dialogTitle: string, dialogItems: AppDialogWindowItem[], x: number, y: number, shouldBeCentered: boolean) {
        title.value = dialogTitle;
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
        items.value = [];
        activeComponent.value = null;
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
        closeDialog,
        title,
    };
});
