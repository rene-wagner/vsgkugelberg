import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@shared/layouts/AdminLayout.vue';
import AdminDashboard from '../views/AdminDashboard.vue';
import UsersListView from '../views/UsersListView.vue';
import UserFormView from '../views/UserFormView.vue';
import DepartmentsListView from '../views/DepartmentsListView.vue';
import DepartmentFormView from '../views/DepartmentFormView.vue';
import CategoriesListView from '../views/CategoriesListView.vue';
import CategoryFormView from '../views/CategoryFormView.vue';
import TagsListView from '../views/TagsListView.vue';
import TagFormView from '../views/TagFormView.vue';
import NewsListView from '../views/NewsListView.vue';
import NewsFormView from '../views/NewsFormView.vue';

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
        path: 'categories/:slug/edit',
        name: 'admin-category-edit',
        component: CategoryFormView,
      },
      {
        path: 'tags',
        name: 'admin-tags',
        component: TagsListView,
      },
      {
        path: 'tags/new',
        name: 'admin-tag-new',
        component: TagFormView,
      },
      {
        path: 'tags/:slug/edit',
        name: 'admin-tag-edit',
        component: TagFormView,
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
    ],
  },
];

export default routes;
