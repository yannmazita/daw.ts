import { useDragState } from "./useDragState";
import { Window, WindowStateInit } from "@/utils/interfaces";

export function useWindows(state: ReturnType<typeof useDragState>) {
    const { windows, defaultWindowProperties } = state;

    function createWindow(initState?: WindowStateInit) {
        const newWindow = {
            ...defaultWindowProperties,
            ...initState,
        }
        windows.value.push(newWindow);
    }

    function closeWindow(id: string) {
        const index = windows.value.findIndex(w => w.id === id);
        if (index != -1) {
            windows.value.splice(index, 1);
        }
    }

    function updateWindow(id: string, updates: Partial<Window>) {
        const index = windows.value.findIndex(w => w.id === id);
        if (index !== -1) {
            windows.value[index] = { ...windows.value[index], ...updates };
        }
    }

    function getWindow(id: string): Window | undefined {
        return windows.value.find(w => w.id === id);
    }

    return {
        createWindow,
        closeWindow,
        updateWindow,
        getWindow,
    }
}
