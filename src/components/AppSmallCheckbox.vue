<template>
    <div class="form-control">
        <label class="label cursor-pointer">
            <span class="label-text">
                <slot name="leftLabel"></slot>
            </span>
            <input v-model="model" type="checkbox" class="checkbox checkbox-sm" />
            <span class="label-text ml-1">
                <slot name="rightLabel"></slot>
            </span>
        </label>
    </div>
</template>

<script setup lang="ts">
// Model State
// Binds the checkbox state to a reactive model for data handling.
const model = defineModel();
</script>
