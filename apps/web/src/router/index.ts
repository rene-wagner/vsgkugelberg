import { createRouter, createWebHistory } from 'vue-router';
import defaultRoutes from '@/modules/default/router/routes';
import adminRoutes from '@/modules/admin/router/routes';

const router = createRouter({
  history: createWebHistory(),
  routes: [...defaultRoutes, ...adminRoutes],
});

export default router;
