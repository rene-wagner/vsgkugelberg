import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@shared/layouts/DefaultLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('../views/DefaultHomeView.vue'),
      },
      {
        path: 'impressum',
        name: 'impressum',
        component: () => import('../views/DefaultLegalNoticeView.vue'),
      },
      {
        path: 'datenschutz',
        name: 'datenschutz',
        component: () => import('../views/DefaultDataPrivacyView.vue'),
      },
      {
        path: 'kontakt',
        name: 'contact',
        component: () => import('../views/DefaultContactView.vue'),
      },
      {
        path: 'verein/geschichte',
        name: 'verein-geschichte',
        component: () => import('../views/verein/DefaultClubHistoryView.vue'),
      },
      {
        path: 'verein/vorstand',
        name: 'verein-vorstand',
        component: () => import('../views/verein/DefaultClubBoardView.vue'),
      },
      {
        path: 'verein/satzung',
        name: 'verein-satzung',
        component: () => import('../views/verein/DefaultClubStatutesView.vue'),
      },
      {
        path: 'verein/mitgliedschaft',
        name: 'verein-mitgliedschaft',
        component: () => import('../views/verein/DefaultClubMembershipView.vue'),
      },
      {
        path: 'verein/beitragsordnung',
        name: 'verein-beitragsordnung',
        component: () => import('../views/verein/DefaultClubMembershipFeeView.vue'),
      },
      {
        path: 'verein/sportversicherung',
        name: 'verein-sportversicherung',
        component: () => import('../views/verein/DefaultClubSportInsuranceView.vue'),
      },
      {
        path: 'abteilung/:slug',
        name: 'department-detail',
        component: () => import('../views/DefaultDepartmentView.vue'),
      },
      {
        path: 'beitrag/:slug',
        name: 'post-detail',
        component: () => import('../views/DefaultPostView.vue'),
      },
    ],
  },
];

export default routes;
