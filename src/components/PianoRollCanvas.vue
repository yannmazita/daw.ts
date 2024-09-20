<template>
    <div class="relative select-none">
        <canvas class="border border-solid border-black" ref="canvas" :width="store.width" :height="store.height"
            @mousedown="handleMouseDown" @mousemove="handleMouseMove" @mouseup="handleMouseUp"
            @contextmenu.prevent="handleRightClick"></canvas>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch, inject, Ref } from 'vue';
import { storeToRefs } from 'pinia';
import { PianoRollPlaybackManager } from '@/services/PianoRollPlaybackManager';
import { pianoRollPlaybackManagerKey } from '@/utils/injection-keys';
import { usePianoRollCanvas } from '@/composables/usePianoRollCanvas';
import { usePianoRollStore } from '@/stores/usePianoRollStore';
import { usePianoRollEvents } from '@/composables/usePianoRollEvents';

const store = usePianoRollStore();
const { pixelsPerBeat, pitchesToShow, notes } = storeToRefs(store);

const canvas = ref<HTMLCanvasElement | null>(null);
const playbackManager = inject<PianoRollPlaybackManager>(pianoRollPlaybackManagerKey) as PianoRollPlaybackManager;

const { drawGrid } = usePianoRollCanvas(canvas as Ref<HTMLCanvasElement>);
const { handleMouseDown, handleMouseMove, handleMouseUp, handleRightClick } = usePianoRollEvents(canvas as Ref<HTMLCanvasElement>, playbackManager, drawGrid);

onMounted(() => {
    drawGrid();
});

watch([pixelsPerBeat, pitchesToShow, notes], () => {
    drawGrid();
});
</script>
