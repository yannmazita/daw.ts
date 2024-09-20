<template>
    <div class="piano-roll-container">
        <PianoRollCanvas></PianoRollCanvas>
        <PianoRollPlaybackControls></PianoRollPlaybackControls>
    </div>
</template>

<script setup lang="ts">
import PianoRollCanvas from '@/components/PianoRollCanvas.vue';
import PianoRollPlaybackControls from '@/components/PianoRollPlaybackControls.vue';
import { onMounted } from 'vue';

const emit = defineEmits<{
    addClasses: [classes: object]
}>();

onMounted(() => {
    emit('addClasses', {
        'flex': true,
        'justify-center': true,
    });
});
</script>
