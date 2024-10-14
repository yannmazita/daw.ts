<template>
    <button class="btn btn-sm w-fit h-fit app-small-button" :class="{ 'disabled': disabled }" :disabled="disabled"
        @click="handleClick">
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
defineProps<{
    disabled?: boolean
}>();

const emit = defineEmits(['click']);

function handleClick() {
    emit('click');
}
</script>

<style scoped>
.app-small-button {
    transition: all 0.3s ease;
}

.app-small-button:hover:not(.disabled) {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.app-small-button:active:not(.disabled) {
    transform: translateY(0);
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.app-small-button.disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.app-small-button.disabled:hover {
    transform: none;
    box-shadow: none;
}
</style>
