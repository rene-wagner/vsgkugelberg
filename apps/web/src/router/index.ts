import { createRouter, createWebHistory } from 'vue-router';
import defaultRoutes from '@/modules/default/router/routes';
import adminRoutes from '@/modules/admin/router/routes';
import authRoutes from '@/modules/auth/router/routes';

const router = createRouter({
  history: createWebHistory(),
  routes: [...defaultRoutes, ...adminRoutes, ...authRoutes],
});

export default router;
