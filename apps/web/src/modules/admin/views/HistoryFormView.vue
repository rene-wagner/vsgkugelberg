<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHistoryStore } from '../stores/historyStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import HistoryHeroForm from '../components/HistoryHeroForm.vue';
import HistoryFoundingForm from '../components/HistoryFoundingForm.vue';
import HistoryDevelopmentForm from '../components/HistoryDevelopmentForm.vue';
import HistoryFestivalsForm from '../components/HistoryFestivalsForm.vue';
import HistoryAchievementsForm from '../components/HistoryAchievementsForm.vue';
import HistoryCtaForm from '../components/HistoryCtaForm.vue';

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
    <div
      v-if="historyStore.successMessage"
      class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-green-600 font-body">
        {{ historyStore.successMessage }}
      </p>
      <button
        class="text-green-600 hover:text-green-800"
        @click="historyStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <div
      v-if="historyStore.error"
      class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-red-600 font-body">{{ historyStore.error }}</p>
      <button
        class="text-red-600 hover:text-red-800"
        @click="historyStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

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
