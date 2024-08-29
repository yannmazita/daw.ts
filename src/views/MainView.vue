<template>
    <AppDrag :minimum-width="500" :minimum-height="500">
        <Sequencer></Sequencer>
    </AppDrag>
</template>

<script setup>
import AppDrag from '@/components/AppDrag.vue'
import Sequencer from '@/components/Sequencer.vue'
</script>
