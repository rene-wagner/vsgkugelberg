import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@shared/layouts/AdminLayout.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UsersListView from '../views/UsersListView.vue';
import UserFormView from '../views/UserFormView.vue';
import DepartmentsListView from '../views/DepartmentsListView.vue';
import DepartmentFormView from '../views/DepartmentFormView.vue';
import CategoriesListView from '../views/CategoriesListView.vue';
import CategoryFormView from '../views/CategoryFormView.vue';
import NewsListView from '../views/NewsListView.vue';
import NewsFormView from '../views/NewsFormView.vue';
import EventsListView from '../views/EventsListView.vue';
import EventFormView from '../views/EventFormView.vue';
import ContactPersonsListView from '../views/ContactPersonsListView.vue';
import ContactPersonFormView from '../views/ContactPersonFormView.vue';
import SettingsView from '../views/SettingsView.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
      },
      {
        path: 'users',
        name: 'admin-users',
        component: UsersListView,
      },
      {
        path: 'users/new',
        name: 'admin-user-new',
        component: UserFormView,
      },
      {
        path: 'users/:id/edit',
        name: 'admin-user-edit',
        component: UserFormView,
      },
      {
        path: 'departments',
        name: 'admin-departments',
        component: DepartmentsListView,
      },
      {
        path: 'departments/new',
        name: 'admin-department-new',
        component: DepartmentFormView,
      },
      {
        path: 'departments/:slug/edit',
        name: 'admin-department-edit',
        component: DepartmentFormView,
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoriesListView,
      },
      {
        path: 'categories/new',
        name: 'admin-category-new',
        component: CategoryFormView,
      },
      {
        path: 'categories/:slug+/edit',
        name: 'admin-category-edit',
        component: CategoryFormView,
      },
      {
        path: 'news',
        name: 'admin-news',
        component: NewsListView,
      },
      {
        path: 'news/new',
        name: 'admin-news-new',
        component: NewsFormView,
      },
      {
        path: 'news/:slug/edit',
        name: 'admin-news-edit',
        component: NewsFormView,
      },
      {
        path: 'events',
        name: 'admin-events',
        component: EventsListView,
      },
      {
        path: 'events/new',
        name: 'admin-event-new',
        component: EventFormView,
      },
      {
        path: 'events/:id/edit',
        name: 'admin-event-edit',
        component: EventFormView,
      },
      {
        path: 'contact-persons',
        name: 'admin-contact-persons',
        component: ContactPersonsListView,
      },
      {
        path: 'contact-persons/new',
        name: 'admin-contact-person-new',
        component: ContactPersonFormView,
      },
      {
        path: 'contact-persons/:id/edit',
        name: 'admin-contact-person-edit',
        component: ContactPersonFormView,
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: SettingsView,
      },
    ],
  },
];

export default routes;
