<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore, type ClubSettings } from '../stores/settingsStore';
import SettingsForm from '../components/forms/SettingsForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';

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
    <AdminPageHeader
      title="Vereinseinstellungen"
      description="Verwalte die globalen Vereinsdaten"
    />

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <SettingsForm
      v-else
      :settings="settings"
    />
  </div>
</template>
