import { defineStore } from 'pinia';
import { Component, ref, Ref } from 'vue';
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';
import { DialogInstance } from '@/utils/interfaces';


export const useDialogStore = defineStore('dialog', () => {
    const dialogs: Ref<DialogInstance[]> = ref([]);

    function openDialog(id: string, dialogTitle: string, dialogItems: AppDialogWindowItem[], x: number, y: number, shouldBeCentered: boolean, context: any = {}): void {
        dialogs.value.push({
            id,
            title: dialogTitle,
            items: dialogItems,
            visible: true,
            activeComponent: null,
            xPos: shouldBeCentered ? window.innerWidth / 2 : x,
            yPos: shouldBeCentered ? window.innerHeight / 2 : y,
            centered: shouldBeCentered,
            context
        });
    }

    function closeDialog(id: string) {
        const index = dialogs.value.findIndex(d => d.id === id);
        if (index !== -1) {
            dialogs.value.splice(index, 1);
        }
    }

    function setActiveComponent(id: string, component: Component) {
        const dialog = dialogs.value.find(d => d.id === id);
        if (dialog) {
            dialog.activeComponent = component;
        }
    }

    return {
        dialogs,
        openDialog,
        closeDialog,
        setActiveComponent
    };
});
