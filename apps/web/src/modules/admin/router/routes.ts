import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: () => import('@shared/layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: () => import('../views/AdminDashboardView.vue'),
      },
      {
        path: 'home',
        name: 'admin-home',
        component: () => import('../views/AdminHomepageView.vue'),
      },
      {
        path: 'verein/geschichte',
        name: 'admin-verein-geschichte',
        component: () => import('../views/AdminClubHistoryFormView.vue'),
      },
      {
        path: 'verein/vorstand',
        name: 'admin-verein-vorstand',
        component: () => import('../views/AdminClubBoardView.vue'),
      },
      {
        path: 'verein/satzung',
        name: 'admin-verein-satzung',
        component: () => import('../views/AdminClubStatutesView.vue'),
      },
      {
        path: 'verein/mitgliedschaft',
        name: 'admin-verein-mitgliedschaft',
        component: () => import('../views/AdminClubMembershipView.vue'),
      },
      {
        path: 'verein/beitragsordnung',
        name: 'admin-verein-beitragsordnung',
        component: () => import('../views/AdminClubMembershipFeeView.vue'),
      },
      {
        path: 'verein/sportversicherung',
        name: 'admin-verein-sportversicherung',
        component: () => import('../views/AdminClubSportInsuranceView.vue'),
      },
      {
        path: 'benutzer',
        name: 'admin-benutzer',
        component: () => import('../views/AdminUserOverviewView.vue'),
      },
      {
        path: 'benutzer/new',
        name: 'admin-user-new',
        component: () => import('../views/AdminUserFormView.vue'),
      },
      {
        path: 'benutzer/:id/edit',
        name: 'admin-user-edit',
        component: () => import('../views/AdminUserFormView.vue'),
      },
      {
        path: 'abteilungen',
        name: 'admin-abteilungen',
        component: () => import('../views/AdminDepartmentOverviewView.vue'),
      },
      {
        path: 'abteilungen/new',
        name: 'admin-abteilung-new',
        component: () => import('../views/AdminDepartmentFormView.vue'),
      },
      {
        path: 'abteilungen/:slug/edit',
        name: 'admin-abteilung-edit',
        component: () => import('../views/AdminDepartmentFormView.vue'),
      },
      {
        path: 'kategorien',
        name: 'admin-kategorien',
        component: () => import('../views/AdminCategoryOverviewView.vue'),
      },
      {
        path: 'kategorien/new',
        name: 'admin-kategorie-new',
        component: () => import('../views/AdminCategoryFormView.vue'),
      },
      {
        path: 'kategorien/:slug+/edit',
        name: 'admin-kategorie-edit',
        component: () => import('../views/AdminCategoryFormView.vue'),
      },
      {
        path: 'beitraege',
        name: 'admin-beitraege',
        component: () => import('../views/AdminPostOverviewView.vue'),
      },
      {
        path: 'beitraege/new',
        name: 'admin-beitrag-new',
        component: () => import('../views/AdminPostFormView.vue'),
      },
      {
        path: 'beitraege/:slug/edit',
        name: 'admin-beitrag-edit',
        component: () => import('../views/AdminPostFormView.vue'),
      },
      {
        path: 'termine',
        name: 'admin-termine',
        component: () => import('../views/AdminEventOverviewView.vue'),
      },
      {
        path: 'termine/new',
        name: 'admin-termin-new',
        component: () => import('../views/AdminEventFormView.vue'),
      },
      {
        path: 'termine/:id/edit',
        name: 'admin-termin-edit',
        component: () => import('../views/AdminEventFormView.vue'),
      },
      {
        path: 'kontakt',
        name: 'admin-kontakt',
        component: () => import('../views/AdminContactPersonOverviewView.vue'),
      },
      {
        path: 'kontakt/new',
        name: 'admin-kontakt-person-new',
        component: () => import('../views/AdminContactPersonFormView.vue'),
      },
      {
        path: 'kontakt/:id/edit',
        name: 'admin-kontakt-person-edit',
        component: () => import('../views/AdminContactPersonFormView.vue'),
      },
      {
        path: 'mediathek',
        name: 'admin-mediathek',
        component: () => import('../views/AdminMediaOverviewView.vue'),
      },
      {
        path: 'einstellungen',
        name: 'admin-einstellungen',
        component: () => import('../views/AdminSettingsView.vue'),
      },
    ],
  },
];

export default routes;
