<template>
    <div class="relative select-none">
        <canvas ref="canvas" :width="width" :height="height" @mousedown="handleMouseDown" @mousemove="handleMouseMove"
            @mouseup="handleMouseUp"></canvas>
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

const canvas = ref<HTMLCanvasElement | null>(null);
const width = ref(window.innerWidth);
const height = ref(800);
const { pixelsPerBeat, pitchesToShow } = storeToRefs(usePianoRollStore());

const pianoManager = inject<PianoRollPlaybackManager>(pianoRollPlaybackManagerKey) as PianoRollPlaybackManager;
const { drawGrid } = usePianoRollCanvas(canvas as Ref<HTMLCanvasElement>, width, height, pixelsPerBeat, pitchesToShow);
const { handleMouseDown, handleMouseMove, handleMouseUp } = usePianoRollEvents(canvas as Ref<HTMLCanvasElement>, height, pianoManager, drawGrid);

onMounted(() => {
    drawGrid();
});

watch([pixelsPerBeat, pitchesToShow], () => {
    drawGrid();
});
</script>

<style scoped>
canvas {
    border: 1px solid black;
}
</style>
