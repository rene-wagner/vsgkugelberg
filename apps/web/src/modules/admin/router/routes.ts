import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@shared/layouts/AdminLayout.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UsersListView from '../views/UsersListView.vue';
import DepartmentsListView from '../views/DepartmentsListView.vue';
import CategoriesListView from '../views/CategoriesListView.vue';
import TagsListView from '../views/TagsListView.vue';
import NewsListView from '../views/NewsListView.vue';

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
        path: 'departments',
        name: 'admin-departments',
        component: DepartmentsListView,
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoriesListView,
      },
      {
        path: 'tags',
        name: 'admin-tags',
        component: TagsListView,
      },
      {
        path: 'news',
        name: 'admin-news',
        component: NewsListView,
      },
    ],
  },
];

export default routes;
