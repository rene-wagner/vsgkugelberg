import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount('#app');

document.addEventListener('DOMContentLoaded', () => {
  const meta = document.createElement('meta');
  meta.httpEquiv = 'Content-Security-Policy';
  meta.content = [
    "default-src 'self';",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval';",
    "style-src 'self' 'unsafe-inline' https://maxcdn.bootstrapcdn.com;",
    `img-src 'self' data: https: ${import.meta.env.VITE_API_BASE_URL};`,
    "font-src 'self' data: https://maxcdn.bootstrapcdn.com;",
    `connect-src 'self' ${import.meta.env.VITE_API_BASE_URL};`,
  ].join('; ');
  document.head.appendChild(meta);
});
