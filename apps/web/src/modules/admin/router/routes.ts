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
        path: 'club-history',
        name: 'admin-history',
        component: () => import('../views/HistoryFormView.vue'),
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../views/UsersListView.vue'),
      },
      {
        path: 'users/new',
        name: 'admin-user-new',
        component: () => import('../views/UserFormView.vue'),
      },
      {
        path: 'users/:id/edit',
        name: 'admin-user-edit',
        component: () => import('../views/UserFormView.vue'),
      },
      {
        path: 'departments',
        name: 'admin-departments',
        component: () => import('../views/DepartmentsListView.vue'),
      },
      {
        path: 'departments/new',
        name: 'admin-department-new',
        component: () => import('../views/DepartmentFormView.vue'),
      },
      {
        path: 'departments/:slug/edit',
        name: 'admin-department-edit',
        component: () => import('../views/DepartmentFormView.vue'),
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: () => import('../views/CategoriesListView.vue'),
      },
      {
        path: 'categories/new',
        name: 'admin-category-new',
        component: () => import('../views/CategoryFormView.vue'),
      },
      {
        path: 'categories/:slug+/edit',
        name: 'admin-category-edit',
        component: () => import('../views/CategoryFormView.vue'),
      },
      {
        path: 'news',
        name: 'admin-news',
        component: () => import('../views/NewsListView.vue'),
      },
      {
        path: 'news/new',
        name: 'admin-news-new',
        component: () => import('../views/NewsFormView.vue'),
      },
      {
        path: 'news/:slug/edit',
        name: 'admin-news-edit',
        component: () => import('../views/NewsFormView.vue'),
      },
      {
        path: 'events',
        name: 'admin-events',
        component: () => import('../views/EventsListView.vue'),
      },
      {
        path: 'events/new',
        name: 'admin-event-new',
        component: () => import('../views/EventFormView.vue'),
      },
      {
        path: 'events/:id/edit',
        name: 'admin-event-edit',
        component: () => import('../views/EventFormView.vue'),
      },
      {
        path: 'contact-persons',
        name: 'admin-contact-persons',
        component: () => import('../views/ContactPersonsListView.vue'),
      },
      {
        path: 'contact-persons/new',
        name: 'admin-contact-person-new',
        component: () => import('../views/ContactPersonFormView.vue'),
      },
      {
        path: 'contact-persons/:id/edit',
        name: 'admin-contact-person-edit',
        component: () => import('../views/ContactPersonFormView.vue'),
      },
      {
        path: 'media',
        name: 'admin-media',
        component: () => import('../views/MediaLibraryView.vue'),
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../views/SettingsView.vue'),
      },
    ],
  },
];

export default routes;
