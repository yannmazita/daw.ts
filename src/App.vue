<template>
    <div class="grid grid-cols-12">
        <AppContextMenu></AppContextMenu>
        <AppDialogWindow></AppDialogWindow>
        <div class="col-span-12">
            <AppTabBar></AppTabBar>
        </div>
        <main class="col-span-12 p-3 overflow-auto">
            <router-view></router-view>
        </main>
    </div>
</template>

<script setup lang="ts">
import AppContextMenu from '@/components/AppContextMenu.vue';
import AppDialogWindow from '@/components/AppDialogWindow.vue';
import AppTabBar from '@/components/AppTabBar.vue';
</script>
