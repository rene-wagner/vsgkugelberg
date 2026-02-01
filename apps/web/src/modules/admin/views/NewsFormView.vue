<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useNewsStore, type NewsItem } from '../stores/newsStore';
import NewsForm from '../components/forms/NewsForm.vue';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

const route = useRoute();
const newsStore = useNewsStore();

const newsItem = ref<NewsItem | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() => (isEditMode.value ? 'ARTIKEL BEARBEITEN' : 'ARTIKEL ERSTELLEN'));
const pageSubtitle = computed(() => (isEditMode.value ? 'Bearbeite die Artikeldaten' : 'Erstelle einen neuen Artikel'));

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
    <AdminPageHeader
      :title="pageTitle"
      :description="pageSubtitle"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="isLoading" />

    <!-- Form -->
    <NewsForm
      v-else
      :news-item="newsItem"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
