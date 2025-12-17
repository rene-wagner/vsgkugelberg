import type { RouteRecordRaw } from 'vue-router';
import AdminLayout from '@shared/layouts/AdminLayout.vue';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      {
        path: '',
        name: 'admin-dashboard',
        component: AdminDashboard,
      },
    ],
  },
];

export default routes;
