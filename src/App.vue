<template>
    <div class="grid grid-cols-12">
        <AppContextMenu></AppContextMenu>
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
import AppTabBar from '@/components/AppTabBar.vue';
</script>
