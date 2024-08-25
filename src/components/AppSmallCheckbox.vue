<template>
    <!-- Checkbox Component -->
    <!-- This component provides a small styled checkbox with optional labels on both sides. -->
    <div class="form-control">
        <label class="label cursor-pointer">
            <!-- Optional Left Label Slot -->
            <!-- Displays content provided in the 'leftLabel' slot, adjacent to the checkbox. -->
            <span class="label-text">
                <slot name="leftLabel"></slot>
            </span>
            <!-- Checkbox Input -->
            <!-- The checkbox itself, styled and scaled down for compact design. -->
            <input v-model="model" type="checkbox" class="checkbox checkbox-sm" />
            <!-- Optional Right Label Slot -->
            <!-- Displays content provided in the 'rightLabel' slot, following the checkbox. -->
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
