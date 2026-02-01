<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHistoryStore } from '../stores/historyStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import HistoryHeroForm from '../components/forms/HistoryHeroForm.vue';
import HistoryFoundingForm from '../components/forms/HistoryFoundingForm.vue';
import HistoryDevelopmentForm from '../components/forms/HistoryDevelopmentForm.vue';
import HistoryFestivalsForm from '../components/forms/HistoryFestivalsForm.vue';
import HistoryAchievementsForm from '../components/forms/HistoryAchievementsForm.vue';
import HistoryCtaForm from '../components/forms/HistoryCtaForm.vue';
import AdminAlert from '../components/AdminAlert.vue';

const historyStore = useHistoryStore();

const activeTab = ref('hero');

const tabs = computed<TabDefinition[]>(() => [
  { id: 'hero', label: 'Hero' },
  { id: 'founding', label: 'Gründung' },
  { id: 'development', label: 'Entwicklung' },
  { id: 'festivals', label: 'Veranstaltungen' },
  { id: 'achievements', label: 'Erfolge' },
  { id: 'cta', label: 'CTA' },
]);

onMounted(async () => {
  await historyStore.fetchHistory();
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <span class="text-vsg-blue-600">Historie</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Vereinshistorie verwalten</h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">Pfleget die Inhalte der Chronik und Meilensteine</p>
    </div>

    <!-- Success/Error Messages -->
    <AdminAlert
      v-if="historyStore.successMessage"
      variant="success"
      :message="historyStore.successMessage"
      dismissible
      class="mb-6"
      @dismiss="historyStore.clearMessages"
    />

    <AdminAlert
      v-if="historyStore.error"
      variant="error"
      :message="historyStore.error"
      dismissible
      class="mb-6"
      @dismiss="historyStore.clearMessages"
    />

    <!-- Loading State -->
    <div
      v-if="historyStore.isLoading && !historyStore.history"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Content with Tabs -->
    <div v-else-if="historyStore.history">
      <!-- Tab Navigation -->
      <VsgTabNav
        v-model:active-tab="activeTab"
        :tabs="tabs"
      />

      <!-- Tab Content -->
      <div class="max-w-4xl">
        <div v-show="activeTab === 'hero'">
          <HistoryHeroForm :history="historyStore.history" />
        </div>
        <div v-show="activeTab === 'founding'">
          <HistoryFoundingForm :history="historyStore.history" />
        </div>
        <div v-show="activeTab === 'development'">
          <HistoryDevelopmentForm :history="historyStore.history" />
        </div>
        <div v-show="activeTab === 'festivals'">
          <HistoryFestivalsForm :history="historyStore.history" />
        </div>
        <div v-show="activeTab === 'achievements'">
          <HistoryAchievementsForm :history="historyStore.history" />
        </div>
        <div v-show="activeTab === 'cta'">
          <HistoryCtaForm :history="historyStore.history" />
        </div>
      </div>
    </div>
  </div>
</template>
