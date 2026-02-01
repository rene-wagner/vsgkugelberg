<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useSettingsStore, type ClubSettings } from '../stores/settingsStore';
import SettingsForm from '../components/forms/SettingsForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

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
    <AdminLoadingState v-if="isLoading" />

    <!-- Form -->
    <SettingsForm
      v-else
      :settings="settings"
    />
  </div>
</template>
