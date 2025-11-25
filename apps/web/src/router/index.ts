import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import AboutUsView from '../views/AboutUsView.vue';
import ContactView from '../views/ContactView.vue';
import LegalNoticeView from '../views/LegalNoticeView.vue';
import PrivacyPolicyView from '../views/PrivacyPolicyView.vue';
import { useUserStore } from '@/stores/user';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/ueber-uns',
      name: 'about-us',
      component: AboutUsView,
    },
    {
      path: '/kontakt',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/impressum',
      name: 'legal-notice',
      component: LegalNoticeView,
    },
    {
      path: '/datenschutz',
      name: 'privacy-policy',
      component: PrivacyPolicyView,
    },
  ],
});

router.beforeEach((to) => {
  if (to.name === 'login') {
    const userStore = useUserStore();

    if (userStore.isAuthenticated) {
      return { name: 'home' };
    }
  }

  return true;
});

export default router;
