import type { RouteRecordRaw } from 'vue-router';
import DefaultLayout from '@shared/layouts/DefaultLayout.vue';
import HomeView from '../views/HomeView.vue';
import ImpressumView from '../views/ImpressumView.vue';
import DatenschutzView from '../views/DatenschutzView.vue';
import ContactView from '../views/ContactView.vue';
import HistoryView from '../views/verein/HistoryView.vue';
import BoardView from '../views/verein/BoardView.vue';
import StatutesView from '../views/verein/StatutesView.vue';
import MembershipView from '../views/verein/MembershipView.vue';
import SponsorsView from '../views/verein/SponsorsView.vue';

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
      {
        path: 'verein/geschichte',
        name: 'verein-geschichte',
        component: HistoryView,
      },
      {
        path: 'verein/vorstand',
        name: 'verein-vorstand',
        component: BoardView,
      },
      {
        path: 'verein/satzung',
        name: 'verein-satzung',
        component: StatutesView,
      },
      {
        path: 'verein/mitgliedschaft',
        name: 'verein-mitgliedschaft',
        component: MembershipView,
      },
      {
        path: 'verein/sponsoren',
        name: 'verein-sponsoren',
        component: SponsorsView,
      },
    ],
  },
];

export default routes;
