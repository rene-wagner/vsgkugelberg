import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: () => import('@shared/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('../views/LoginView.vue'),
      },
    ],
  },
  {
    path: '/forgot-password',
    component: () => import('@shared/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: () => import('../views/ForgotPasswordView.vue'),
      },
    ],
  },
  {
    path: '/reset-password',
    component: () => import('@shared/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'reset-password',
        component: () => import('../views/ResetPasswordView.vue'),
      },
    ],
  },
];

export default routes;
