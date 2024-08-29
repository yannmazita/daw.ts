<template>
    <div class="bg-blue-700 h-14">boudary test</div>
    <div class="flex size-3/4 bg-green-700">
        <AppDrag :minimum-width="500" :minimum-height="500">
            <Sequencer></Sequencer>
        </AppDrag>
    </div>
</template>

<script setup>
import AppDrag from '@/components/AppDrag.vue'
import Sequencer from '@/components/Sequencer.vue'
</script>
