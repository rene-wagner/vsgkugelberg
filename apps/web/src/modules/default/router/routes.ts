import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@shared/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/HomeView.vue'),
      },
      {
        path: 'impressum',
        name: 'impressum',
        component: () => import('../views/ImpressumView.vue'),
      },
      {
        path: 'datenschutz',
        name: 'datenschutz',
        component: () => import('../views/DatenschutzView.vue'),
      },
      {
        path: 'kontakt',
        name: 'contact',
        component: () => import('../views/ContactView.vue'),
      },
      {
        path: 'verein/geschichte',
        name: 'verein-geschichte',
        component: () => import('../views/verein/HistoryView.vue'),
      },
      {
        path: 'verein/vorstand',
        name: 'verein-vorstand',
        component: () => import('../views/verein/BoardView.vue'),
      },
      {
        path: 'verein/satzung',
        name: 'verein-satzung',
        component: () => import('../views/verein/StatutesView.vue'),
      },
      {
        path: 'verein/mitgliedschaft',
        name: 'verein-mitgliedschaft',
        component: () => import('../views/verein/MembershipView.vue'),
      },
      {
        path: 'abteilung/:slug',
        name: 'department-detail',
        component: () => import('../views/DepartmentDetailView.vue'),
      },
    ],
  },
];

export default routes;
