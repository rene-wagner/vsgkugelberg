import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@shared/layouts/DefaultLayout.vue';
import LoginView from '../views/LoginView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: DefaultLayout,
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
