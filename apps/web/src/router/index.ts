import { createRouter, createWebHistory } from 'vue-router';
import defaultRoutes from '@/modules/default/router/routes';
import adminRoutes from '@/modules/admin/router/routes';
import authRoutes from '@/modules/auth/router/routes';
import { useAuthStore } from '@/modules/auth/stores/authStore';

const router = createRouter({
  history: createWebHistory(),
  routes: [...defaultRoutes, ...adminRoutes, ...authRoutes],
});

let isInitialized = false;

router.beforeEach(async (to) => {
  // Access store inside the guard to ensure Pinia is initialized
  const authStore = useAuthStore();

  // Check auth on first navigation (app initialization)
  if (!isInitialized) {
    isInitialized = true;
    await authStore.checkAuth();
  }

  // Redirect authenticated users away from login page
  if (to.path === '/login' && authStore.isAuthenticated) {
    return '/admin';
  }

  // Protect routes that require authentication
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return '/login';
  }
});

export default router;
