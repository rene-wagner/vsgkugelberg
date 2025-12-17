import type { RouteRecordRaw } from 'vue-router';
import AuthLayout from '@shared/layouts/AuthLayout.vue';
import LoginView from '../views/LoginView.vue';

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
];

export default routes;
