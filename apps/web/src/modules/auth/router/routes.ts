import type { RouteRecordRaw } from 'vue-router';
import AuthLayout from '@shared/layouts/AuthLayout.vue';
import LoginView from '../views/LoginView.vue';
import ForgotPasswordView from '../views/ForgotPasswordView.vue';
import ResetPasswordView from '../views/ResetPasswordView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'login',
        component: LoginView,
      },
    ],
  },
  {
    path: '/forgot-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'forgot-password',
        component: ForgotPasswordView,
      },
    ],
  },
  {
    path: '/reset-password',
    component: AuthLayout,
    children: [
      {
        path: '',
        name: 'reset-password',
        component: ResetPasswordView,
      },
    ],
  },
];

export default routes;
