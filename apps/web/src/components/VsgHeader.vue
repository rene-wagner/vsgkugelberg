<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import VsgNavigationMenu from './VsgNavigationMenu.vue';
import VsgDrawer from './VsgDrawer.vue';
import { useUserStore } from '@/stores/user';
import { useEditModeStore } from '@/stores/editMode';
import { usePageBuilderStore } from '@/stores/pageBuilder';
import { logout } from '@/utils/apiClient';

const menuItems = [
  { label: 'Startseite', path: '/' },
  { label: 'Über uns', path: '/ueber-uns' },
  { label: 'Kontakt', path: '/kontakt' },
];

const userStore = useUserStore();
const { isAuthenticated, username } = storeToRefs(userStore);

const editModeStore = useEditModeStore();
const { isEditMode } = storeToRefs(editModeStore);

const pageBuilderStore = usePageBuilderStore();

const isDrawerOpen = ref(false);

const openDrawer = () => {
  isDrawerOpen.value = true;
};

const closeDrawer = () => {
  isDrawerOpen.value = false;
};

const handleLogout = async () => {
  await logout();
  userStore.clearUser();
  closeDrawer();
};

const handleSave = () => {
  pageBuilderStore.exportPageStructure();
};
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

          <div v-if="isAuthenticated" class="hidden md:flex items-center space-x-2">
            <button
              type="button"
              class="p-2 text-white hover:bg-[#003d8a] rounded-lg transition-colors"
              :class="{ 'bg-[#003d8a]': isEditMode }"
              aria-label="Bearbeitungsmodus umschalten"
              :aria-pressed="isEditMode"
              @click="editModeStore.toggleEditMode"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              v-if="isEditMode"
              type="button"
              class="p-2 text-white hover:bg-[#003d8a] rounded-lg transition-colors"
              aria-label="Seite speichern"
              @click="handleSave"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            </button>
            <button
              type="button"
              class="p-2 text-white hover:bg-[#003d8a] rounded-lg transition-colors"
              aria-label="Schnellzugriff öffnen"
              @click="openDrawer"
            >
              <svg
                class="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <VsgDrawer
      :is-open="isDrawerOpen"
      :username="username"
      @close="closeDrawer"
      @logout="handleLogout"
    />
  </header>
</template>
