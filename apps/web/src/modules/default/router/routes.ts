import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@shared/layouts/DefaultLayout.vue';
import HomeView from '../views/HomeView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        name: 'home',
        component: HomeView,
      },
    ],
  },
];

export default routes;
