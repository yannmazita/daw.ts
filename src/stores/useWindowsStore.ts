import { Window } from '@/utils/interfaces';
import { markRaw, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import AppDefaultWindow from '@/components/AppDefaultWindow.vue';

export const useWindowsStore = defineStore('windows', () => {
    const windows = reactive(new Map<string, Window>());

    const defaultWindowProperties: Window = {
        id: uuidv4(),
        isVisible: true,
        windowComponent: markRaw(AppDefaultWindow),
        windowComponentKey: uuidv4(),
        xPos: 100,
        yPos: 100,
        minimumWidth: 320,
        maximumWidth: 1024,
        minimumHeight: 240,
        maximumHeight: 768,
        initialWidth: 640,
        initialHeight: 480,
        windowProps: {},
        dragging: false,
        resizing: false,
        resizeDirection: '',
        lastMouseX: 0,
        lastMouseY: 0,
        width: 640,
        height: 480,
    };

    function createWindow(initState?: Partial<Window>) {
        const id = uuidv4();
        const newWindow: Window = {
            id,
            isVisible: true,
            windowComponent: markRaw(AppDefaultWindow),
            windowComponentKey: uuidv4(),
            xPos: 100,
            yPos: 100,
            width: 640,
            height: 480,
            minimumWidth: 320,
            maximumWidth: 1024,
            minimumHeight: 240,
            maximumHeight: 768,
            initialWidth: 640,
            initialHeight: 480,
            windowProps: {},
            dragging: false,
            resizing: false,
            resizeDirection: '',
            lastMouseX: 0,
            lastMouseY: 0,
            ...initState,
        };
        windows.set(id, newWindow);
    }

    function closeWindow(id: string) {
        windows.delete(id);
    }

    function updateWindow(id: string, updates: Partial<Window>) {
        const window = windows.get(id);
        if (window) {
            const updatedWindow = { ...window, ...updates };
            windows.set(id, updatedWindow);
        }
    }

    function getWindow(id: string): Window | undefined {
        return windows.get(id);
    }

    return {
        windows,
        defaultWindowProperties,
        createWindow,
        closeWindow,
        updateWindow,
        getWindow,
    };
})
