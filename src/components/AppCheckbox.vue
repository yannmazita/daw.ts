<template>
    <input type="checkbox" :checked="checked" class="checkbox" />
</template>
<script lang="ts">
import { computed, ref, Ref } from 'vue';

const check: Ref<boolean> = ref(false);

const checked = computed<string>(() => {
    if (check) {
        return "checked"
    }
    else {
        return ""
    }
})

function toggleCheck(): void {
    check.value = !check.value;
}
</script>
