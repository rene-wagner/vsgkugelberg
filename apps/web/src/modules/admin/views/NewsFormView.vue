<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNewsStore, type NewsItem } from '../stores/newsStore';
import NewsForm from '../components/NewsForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const newsStore = useNewsStore();

const newsItem = ref<NewsItem | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() => (isEditMode.value ? 'ARTIKEL BEARBEITEN' : 'ARTIKEL ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Artikeldaten' : 'Erstelle einen neuen Artikel'));
const breadcrumbAction = computed(() => (isEditMode.value ? 'Bearbeiten' : 'Erstellen'));

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const slug = route.params.slug as string;
    newsItem.value = await newsStore.fetchNewsItem(slug);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <router-link to="/admin/beitraege" class="hover:text-vsg-blue-600 transition-colors"> Beiträge </router-link>
        <FontAwesomeIcon icon="chevron-right" />
        <span class="text-vsg-blue-600">{{ breadcrumbAction }}</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        {{ pageTitle }}
      </h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <NewsForm v-else :news-item="newsItem" :is-edit-mode="isEditMode" />
  </div>
</template>
