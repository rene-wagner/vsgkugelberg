<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore, type ClubSettings } from '../stores/settingsStore';
import SettingsForm from '../components/SettingsForm.vue';

const settingsStore = useSettingsStore();

const settings = ref<ClubSettings | null>(null);
const isLoading = ref(true);

onMounted(async () => {
  isLoading.value = true;
  settings.value = await settingsStore.fetchSettings();
  isLoading.value = false;
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <router-link to="/admin" class="hover:text-vsg-blue-600 transition-colors"> Dashboard </router-link>
        <FontAwesomeIcon icon="chevron-right" />
        <span class="text-vsg-blue-600">Einstellungen</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Vereinseinstellungen</h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">Verwalte die globalen Vereinsdaten</p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <SettingsForm v-else :settings="settings" />
  </div>
</template>
