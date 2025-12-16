import type { RouteRecordRaw } from 'vue-router';
import AdminDashboard from '../views/AdminDashboard.vue';

const routes: RouteRecordRaw[] = [
  {
    path: '/admin',
    name: 'admin-dashboard',
    component: AdminDashboard,
  },
];

export default routes;
