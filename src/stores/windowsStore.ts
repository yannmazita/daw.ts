import { defineStore } from 'pinia';
import { markRaw, ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';
import { WindowState, WindowStateInit } from '@/utils/interfaces';
import AppDefaultWindow from '@/components/AppDefaultWindow.vue';


export const useWindowStore = defineStore('windows', () => {
    const windows = ref<WindowState[]>([]);

    const defaultWindowState: WindowState = {
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
    };

    function createWindow(initState?: WindowStateInit) {
        const defaultState: WindowState | object = {};
        Object.assign(defaultState, defaultWindowState);
        windows.value.push({ ...{ id: uuidv4(), isVisible: true, windowComponent: markRaw(AppDefaultWindow), windowComponentKey: uuidv4(), xPos: 100, yPos: 100, minimumWidth: 320, maximumWidth: 1024, minimumHeight: 240, maximumHeight: 768, initialWidth: 640, initialHeight: 480, windowProps: {} }, ...initState });
    }

    function closeWindow(id: string) {
        const index = windows.value.findIndex(w => w.id === id);
        if (index !== -1) {
            windows.value.splice(index, 1);
        }
    }

    function updateWindow(id: string, updates: Partial<WindowState>) {
        const index = windows.value.findIndex(w => w.id === id);
        if (index !== -1) {
            windows.value[index] = { ...windows.value[index], ...updates };
        }
    }

    return { windows, createWindow, closeWindow, updateWindow };
});
