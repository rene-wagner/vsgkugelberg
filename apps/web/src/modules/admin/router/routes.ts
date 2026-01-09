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
        component: () => import('../views/AdminDashboard.vue'),
      },
      {
        path: 'home',
        name: 'admin-home',
        component: () => import('../views/HomeView.vue'),
      },
      {
        path: 'verein/geschichte',
        name: 'admin-verein-geschichte',
        component: () => import('../views/HistoryFormView.vue'),
      },
      {
        path: 'verein/vorstand',
        name: 'admin-verein-vorstand',
        component: () => import('../views/BoardView.vue'),
      },
      {
        path: 'verein/satzung',
        name: 'admin-verein-satzung',
        component: () => import('../views/StatutesView.vue'),
      },
      {
        path: 'verein/mitgliedschaft',
        name: 'admin-verein-mitgliedschaft',
        component: () => import('../views/MembershipView.vue'),
      },
      {
        path: 'benutzer',
        name: 'admin-benutzer',
        component: () => import('../views/UsersListView.vue'),
      },
      {
        path: 'benutzer/new',
        name: 'admin-user-new',
        component: () => import('../views/UserFormView.vue'),
      },
      {
        path: 'benutzer/:id/edit',
        name: 'admin-user-edit',
        component: () => import('../views/UserFormView.vue'),
      },
      {
        path: 'abteilungen',
        name: 'admin-abteilungen',
        component: () => import('../views/DepartmentsListView.vue'),
      },
      {
        path: 'abteilungen/new',
        name: 'admin-abteilung-new',
        component: () => import('../views/DepartmentFormView.vue'),
      },
      {
        path: 'abteilungen/:slug/edit',
        name: 'admin-abteilung-edit',
        component: () => import('../views/DepartmentFormView.vue'),
      },
      {
        path: 'kategorien',
        name: 'admin-kategorien',
        component: () => import('../views/CategoriesListView.vue'),
      },
      {
        path: 'kategorien/new',
        name: 'admin-kategorie-new',
        component: () => import('../views/CategoryFormView.vue'),
      },
      {
        path: 'kategorien/:slug+/edit',
        name: 'admin-kategorie-edit',
        component: () => import('../views/CategoryFormView.vue'),
      },
      {
        path: 'beitraege',
        name: 'admin-beitraege',
        component: () => import('../views/NewsListView.vue'),
      },
      {
        path: 'beitraege/new',
        name: 'admin-beitrag-new',
        component: () => import('../views/NewsFormView.vue'),
      },
      {
        path: 'beitraege/:slug/edit',
        name: 'admin-beitrag-edit',
        component: () => import('../views/NewsFormView.vue'),
      },
      {
        path: 'termine',
        name: 'admin-termine',
        component: () => import('../views/EventsListView.vue'),
      },
      {
        path: 'termine/new',
        name: 'admin-termin-new',
        component: () => import('../views/EventFormView.vue'),
      },
      {
        path: 'termine/:id/edit',
        name: 'admin-termin-edit',
        component: () => import('../views/EventFormView.vue'),
      },
      {
        path: 'kontakt',
        name: 'admin-kontakt',
        component: () => import('../views/ContactPersonsListView.vue'),
      },
      {
        path: 'kontakt/new',
        name: 'admin-kontakt-person-new',
        component: () => import('../views/ContactPersonFormView.vue'),
      },
      {
        path: 'kontakt/:id/edit',
        name: 'admin-kontakt-person-edit',
        component: () => import('../views/ContactPersonFormView.vue'),
      },
      {
        path: 'mediathek',
        name: 'admin-mediathek',
        component: () => import('../views/MediaLibraryView.vue'),
      },
      {
        path: 'einstellungen',
        name: 'admin-einstellungen',
        component: () => import('../views/SettingsView.vue'),
      },
    ],
  },
];

export default routes;
