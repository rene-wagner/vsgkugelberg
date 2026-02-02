<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useHomepageContentStore } from '../stores/homepageContentStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import HomepageHeroForm from '../components/forms/HomepageHeroForm.vue';
import HomepageStatsForm from '../components/forms/HomepageStatsForm.vue';
import HomepageDepartmentsForm from '../components/forms/HomepageDepartmentsForm.vue';
import HomepagePostsForm from '../components/forms/HomepagePostsForm.vue';
import HomepageCtaForm from '../components/forms/HomepageCtaForm.vue';
import { VsgAlert } from '@/shared/components';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

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
    <AdminPageHeader
      title="Startseite verwalten"
      description="Pflegen Sie die Inhalte der Startseite"
    />

    <!-- Success/Error Messages -->
    <VsgAlert
      v-if="homepageContentStore.successMessage"
      variant="success"
      :message="homepageContentStore.successMessage"
      dismissible
      class="mb-6"
      @dismiss="homepageContentStore.clearMessages"
    />

    <VsgAlert
      v-if="homepageContentStore.error"
      variant="error"
      :message="homepageContentStore.error"
      dismissible
      class="mb-6"
      @dismiss="homepageContentStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="homepageContentStore.isLoading && !homepageContentStore.homepageContent" />

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
