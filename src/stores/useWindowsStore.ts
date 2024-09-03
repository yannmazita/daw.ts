import { Window } from '@/utils/interfaces';
import { markRaw, reactive } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { defineStore } from 'pinia';
import AppDefaultWindow from '@/components/AppDefaultWindow.vue';

export const useWindowsStore = defineStore('windows', () => {
    const windows = reactive(new Map<string, Window>());
    let currentZIndex = 100;

    function createWindow(initState?: Partial<Window>) {
        const id = uuidv4();
        const newWindow: Window = {
            id,
            isMinimized: false,
            isMaximized: false,
            windowComponent: markRaw(AppDefaultWindow),
            windowComponentKey: uuidv4(),
            xPos: 100,
            yPos: 100,
            width: 800,
            height: 600,
            minimumWidth: 320,
            maximumWidth: 1024,
            minimumHeight: 240,
            maximumHeight: 768,
            initialWidth: 800,
            initialHeight: 600,
            restoreSize: { width: 640, height: 480, xPos: 100, yPos: 100 },
            windowProps: { id: id },
            dragging: false,
            resizing: false,
            resizeDirection: '',
            lastMouseX: 0,
            lastMouseY: 0,
            zIndex: currentZIndex++,
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

    function maximizeWindow(id: string) {
        const window = windows.get(id);
        if (window) {
            if (!window.isMaximized) {
                window.restoreSize = { width: window.width, height: window.height, xPos: window.xPos, yPos: window.yPos };
                window.isMaximized = true;
            } else {
                window.width = window.restoreSize.width;
                window.height = window.restoreSize.height;
                window.xPos = window.restoreSize.xPos;
                window.yPos = window.restoreSize.yPos;
                window.isMaximized = false;
            }
            windows.set(id, window);
        }
    }

    function minimizeWindow(id: string) {
        const window = windows.get(id);
        if (window) {
            if (window.isMinimized) {
                window.isMinimized = false;
            } else {
                window.isMinimized = true;
            }
            windows.set(id, window);
        }
    }

    function focusWindow(id: string) {
        const highestZIndex = Math.max(...Array.from(windows.values()).map(w => w.zIndex)) + 1;
        const window = windows.get(id);
        if (window) {
            window.zIndex = highestZIndex;
            currentZIndex = highestZIndex + 1;
            windows.set(id, window);
        }
    }

    function getWindow(id: string): Window | undefined {
        return windows.get(id);
    }

    return {
        windows,
        createWindow,
        closeWindow,
        updateWindow,
        maximizeWindow,
        minimizeWindow,
        focusWindow,
        getWindow,
    };
})
