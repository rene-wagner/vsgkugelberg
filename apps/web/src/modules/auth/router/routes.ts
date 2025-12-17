import type { RouteRecordRaw } from 'vue-router';
import LoginView from '../views/LoginView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      layout: 'empty',
    },
  },
];

export default routes;
