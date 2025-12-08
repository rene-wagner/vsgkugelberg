<script setup lang="ts">
import { ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import VsgNavigationMenu from './VsgNavigationMenu.vue';
import VsgDrawer from './VsgDrawer.vue';
import { VsgIconEdit, VsgIconSave, VsgIconSpinner, VsgIconMenu } from '@/components/icons';
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
const { isLoading: isSaving } = storeToRefs(pageBuilderStore);

const route = useRoute();

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

const handleSave = async () => {
  try {
    await pageBuilderStore.saveBlocks(route.path);
  } catch {
    // Error is already captured in store.error
  }
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
              <VsgIconEdit />
            </button>
            <button
              v-if="isEditMode"
              type="button"
              class="p-2 text-white hover:bg-[#003d8a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Seite speichern"
              :disabled="isSaving"
              @click="handleSave"
            >
              <VsgIconSave v-if="!isSaving" />
              <VsgIconSpinner v-else />
            </button>
            <button
              type="button"
              class="p-2 text-white hover:bg-[#003d8a] rounded-lg transition-colors"
              aria-label="Schnellzugriff öffnen"
              @click="openDrawer"
            >
              <VsgIconMenu />
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
