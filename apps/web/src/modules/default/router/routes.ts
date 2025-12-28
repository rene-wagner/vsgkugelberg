import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@shared/layouts/DefaultLayout.vue';
import HomeView from '../views/HomeView.vue';
import ImpressumView from '../views/ImpressumView.vue';
import DatenschutzView from '../views/DatenschutzView.vue';
import ContactView from '../views/ContactView.vue';

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
      {
        path: 'contact',
        name: 'contact',
        component: ContactView,
      },
    ],
  },
];

export default routes;
