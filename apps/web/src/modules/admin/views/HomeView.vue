<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHomepageContentStore } from '../stores/homepageContentStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import HomepageHeroForm from '../components/forms/HomepageHeroForm.vue';
import HomepageStatsForm from '../components/forms/HomepageStatsForm.vue';
import HomepageDepartmentsForm from '../components/forms/HomepageDepartmentsForm.vue';
import HomepagePostsForm from '../components/forms/HomepagePostsForm.vue';
import HomepageCtaForm from '../components/forms/HomepageCtaForm.vue';

const homepageContentStore = useHomepageContentStore();

const activeTab = ref('hero');

const tabs = computed<TabDefinition[]>(() => [
  { id: 'hero', label: 'Hero' },
  { id: 'stats', label: 'Statistiken' },
  { id: 'departments', label: 'Abteilungen' },
  { id: 'posts', label: 'Beiträge' },
  { id: 'cta', label: 'CTA' },
]);

onMounted(async () => {
  await homepageContentStore.fetchHomepageContent();
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <span class="text-vsg-blue-600">Startseite</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Startseite verwalten</h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">Pflegen Sie die Inhalte der Startseite</p>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="homepageContentStore.successMessage"
      class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-green-600 font-body">
        {{ homepageContentStore.successMessage }}
      </p>
      <button
        class="text-green-600 hover:text-green-800"
        @click="homepageContentStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <div
      v-if="homepageContentStore.error"
      class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-red-600 font-body">{{ homepageContentStore.error }}</p>
      <button
        class="text-red-600 hover:text-red-800"
        @click="homepageContentStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="homepageContentStore.isLoading && !homepageContentStore.homepageContent"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Content with Tabs -->
    <div v-else-if="homepageContentStore.homepageContent">
      <!-- Tab Navigation -->
      <VsgTabNav
        v-model:active-tab="activeTab"
        :tabs="tabs"
      />

      <!-- Tab Content -->
      <div class="max-w-4xl">
        <div v-show="activeTab === 'hero'">
          <HomepageHeroForm :homepage-content="homepageContentStore.homepageContent" />
        </div>
        <div v-show="activeTab === 'stats'">
          <HomepageStatsForm :homepage-content="homepageContentStore.homepageContent" />
        </div>
        <div v-show="activeTab === 'departments'">
          <HomepageDepartmentsForm :homepage-content="homepageContentStore.homepageContent" />
        </div>
        <div v-show="activeTab === 'posts'">
          <HomepagePostsForm :homepage-content="homepageContentStore.homepageContent" />
        </div>
        <div v-show="activeTab === 'cta'">
          <HomepageCtaForm :homepage-content="homepageContentStore.homepageContent" />
        </div>
      </div>
    </div>
  </div>
</template>
