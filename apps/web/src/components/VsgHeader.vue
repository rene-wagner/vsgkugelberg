<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import VsgNavigationMenu from './VsgNavigationMenu.vue';
import { useUserStore } from '@/stores/user';

const menuItems = [
  { label: 'Startseite', path: '/' },
  { label: 'Über uns', path: '/ueber-uns' },
  { label: 'Kontakt', path: '/kontakt' },
];

const userStore = useUserStore();
const { isAuthenticated, username } = storeToRefs(userStore);
</script>

<template>
  <header class="bg-[#00295e] text-white shadow-lg sticky top-0 z-50">
    <div class="container mx-auto px-4">
      <div class="flex items-center justify-between h-16">
        <RouterLink to="/" class="flex items-center space-x-2">
          <div class="w-8 h-8 bg-[#ddad1e] rounded-full flex items-center justify-center">
            <span class="text-[#00295e] font-bold text-sm">SV</span>
          </div>
          <span class="font-bold text-xl">Sportverein</span>
        </RouterLink>

        <div class="flex items-center space-x-6">
          <VsgNavigationMenu :menu-items="menuItems" />

          <div v-if="isAuthenticated" class="hidden md:flex items-center space-x-2 text-sm">
            <span class="text-gray-200">Eingeloggt als</span>
            <span class="font-semibold">{{ username }}</span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>
