<template>
    <AppWindowManager :isActive=true :top=0 :left=0 :width=800 :height=600 :minWidth=500 :minHeight=500
        :isResizing="['r', 'rb', 'b', 'lb', 'l', 'lt', 't', 'rt']" :isButtonMaximized=true :isButtonMinimized=true
        :isMaximized=false :maxWidth=1280 :maxHeight=720 windowId=1 title="Sequencer" titleIcon="" @clickWindow=""
        @clickDestroy="" @clickMin="">
        <div class="flex justify-center">
            <Sequencer></Sequencer>
        </div>
    </AppWindowManager>
</template>

<script setup lang="ts">
import AppWindowManager from '@/components/AppWindowManager.vue';
import Sequencer from '@/components/Sequencer.vue';
</script>
