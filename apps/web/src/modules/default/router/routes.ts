import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@shared/layouts/DefaultLayout.vue';
import HomeView from '../views/HomeView.vue';
import ImpressumView from '../views/ImpressumView.vue';
import DatenschutzView from '../views/DatenschutzView.vue';

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
      {
        path: 'impressum',
        name: 'impressum',
        component: ImpressumView,
      },
      {
        path: 'datenschutz',
        name: 'datenschutz',
        component: DatenschutzView,
      },
    ],
  },
];

export default routes;
