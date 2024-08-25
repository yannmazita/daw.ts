<template>
    <!-- Small Button Component -->
    <!-- Provides a smaller-sized button that emits a click event when clicked -->
    <button class="btn btn-sm w-fit h-fit" @click="handleClick">
        <!-- Slot for dynamic content insertion -->
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
const emit = defineEmits(['click']);

function handleClick() {
    emit('click');  // Emit the 'click' event to notify parent components
}
</script>
