import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import Home from './components/Home.vue';
import KanjiTest from './components/KanjiTest.vue';
import Result from './components/Result.vue';
import './style.css';

const pinia = createPinia()
const router = createRouter({
    routes: [
        {
            path: "/",
            component: Home,
            name: "home"
        },
        {
            path: "/test",
            component: KanjiTest,
            name: "test"
        },
        {
            path: "/result",
            component: Result,
            name: "result"
        },
    ],
    history: createWebHistory(),
})

createApp(App)
    .use(router)
    .use(pinia)
    .use(PrimeVue, {
        unstyled: true
    })
    .mount('#app')
