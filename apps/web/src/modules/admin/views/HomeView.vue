<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHomepageContentStore } from '../stores/homepageContentStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import HomepageHeroForm from '../components/forms/HomepageHeroForm.vue';
import HomepageStatsForm from '../components/forms/HomepageStatsForm.vue';
import HomepageDepartmentsForm from '../components/forms/HomepageDepartmentsForm.vue';
import HomepagePostsForm from '../components/forms/HomepagePostsForm.vue';
import HomepageCtaForm from '../components/forms/HomepageCtaForm.vue';
import AdminAlert from '../components/AdminAlert.vue';

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
    <AdminAlert
      v-if="homepageContentStore.successMessage"
      variant="success"
      :message="homepageContentStore.successMessage"
      dismissible
      class="mb-6"
      @dismiss="homepageContentStore.clearMessages"
    />

    <AdminAlert
      v-if="homepageContentStore.error"
      variant="error"
      :message="homepageContentStore.error"
      dismissible
      class="mb-6"
      @dismiss="homepageContentStore.clearMessages"
    />

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
