import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { createPinia } from 'pinia';
import '@/style.css';
import App from '@/App.vue';

import MainView from '@/views/MainView.vue';

const pinia = createPinia()
const router = createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: '/',
            name: 'Main',
            component: MainView,
        },
    ]
})

createApp(App).use(router).use(pinia).mount('#app')
