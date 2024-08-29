<template>
    <AppWindow v-bind="windowProp" @clickWindow="" @clickDestroy="" @clickMin="">
        <div class="flex justify-center">
            <Sequencer></Sequencer>
        </div>
    </AppWindow>
</template>

<script setup lang="ts">
import AppWindow from '@/components/AppWindow.vue';
import { WindowProps } from '@/utils/interfaces';
import Sequencer from '@/components/Sequencer.vue';

const windowProp: WindowProps = {
    isActive: true,
    top: 0,
    left: 0,
    width: 800,
    height: 600,
    minWidth: 500,
    minHeight: 500,
    isResizing: ['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt'],
    isButtonMaximized: true,
    isButtonMinimized: true,
    isMaximized: false,
    maxWidth: 1280,
    maxHeight: 720,
    windowId: '1',
    windowInnerWidth: 0,
    title: 'Sequencer',
    titleIcon: '',
};
</script>
