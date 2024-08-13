<template>
    <button class="btn btn-sm w-fit h-fit" @click="handleClick">
        <slot></slot>
    </button>
</template>
<script setup lang="ts">
const emit = defineEmits(['click']);

function handleClick() {
    emit('click')
}
</script>
