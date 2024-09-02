<template>
    <canvas ref="canvas" :width="width" :height="height"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';

const canvas = ref<HTMLCanvasElement | null>(null);
const width = ref(window.innerWidth);
const height = ref(800);
const pixelsPerBeat = ref(100);
const pitchesToShow = ref(88);

onMounted(() => {
    drawGrid();
});

watch([pixelsPerBeat], () => {
    drawGrid();
});

function drawGrid() {
    const ctx = canvas.value?.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width.value, height.value);
    drawHorizontalLines(ctx);
    drawVerticalLines(ctx);
}

function drawHorizontalLines(ctx: CanvasRenderingContext2D) {
    for (let i = 0; i <= height.value; i += pixelsPerBeat.value) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width.value, i);
        ctx.stroke();
    }
}

function drawVerticalLines(ctx: CanvasRenderingContext2D) {
    const keyHeight = height.value / pitchesToShow.value;
    for (let i = 0; i <= pitchesToShow.value; i++) {
        ctx.beginPath();
        ctx.moveTo(i * keyHeight, 0);
        ctx.lineTo(i * keyHeight, height.value);
        ctx.stroke();
    }
}
</script>

<style>
canvas {
    border: 1px solid black;
}
</style>
