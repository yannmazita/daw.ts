import { defineStore } from 'pinia';
import { Component, ref, Ref } from 'vue';
import { AppDialogWindowItem } from '@/models/AppDialogWindowItem';

export const useDialogStore = defineStore('dialog', () => {
    const items: Ref<AppDialogWindowItem[]> = ref([]);
    const visible: Ref<boolean> = ref(false);
    const activeComponent: Ref<Component | null> = ref(null);
    const xPos: Ref<number> = ref(0);
    const yPos: Ref<number> = ref(0);
    //const adjustX: Ref<number> = ref(0);
    //const adjustY: Ref<number> = ref(0);
    const centered: Ref<boolean> = ref(false);

    /**
     * Sets the active component displaying content on the right side of the window.
     *
     * @param component The component to display
     */
    function setActiveComponent(component: Component): void {
        activeComponent.value = component;
    }

    function adjustDialogPosition(elementId: string) {
        const dialogElement = document.getElementById(elementId);
        if (dialogElement) {
            const rect = dialogElement.getBoundingClientRect();
            xPos.value -= rect.width / 2;
            yPos.value -= rect.height / 2;
        }
    }

    /**
     * Opens a dialog window at the specified x and y coordinates.
     *
     * @remarks You need to pass the component through the markRaw(Component) function.
     *
     * @param dialogItems The dialog window items on the left side.
     * @param x The x-coordinate of the dialog window.
     * @param y The y-coordinate of the dialog window.
     * @param centered A boolean value that indicates whether the dialog window should be centered.
     */
    function openDialog(dialogItems: AppDialogWindowItem[], x: number, y: number, centered: boolean): void {
        if (!centered) {
            centered = false;
            xPos.value = x;
            yPos.value = y;
        }
        else {
            centered = true;
            xPos.value = window.innerWidth / 2;
            yPos.value = window.innerHeight / 2;
        }
        visible.value = true;
        items.value = dialogItems;
    }

    /**
     * Closes the dialog window.
     */
    function closeDialog(): void {
        visible.value = false;
        centered.value = false;
    }

    return {
        items,
        visible,
        activeComponent,
        xPos,
        yPos,
        setActiveComponent,
        openDialog,
        closeDialog,
        centered,
        adjustDialogPosition,
    };
});
