<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import VsgSectionHeader from '@shared/components/VsgSectionHeader.vue';
import VsgLinkArrow from '@shared/components/VsgLinkArrow.vue';
import NewsCardFeatured from './NewsCardFeatured.vue';
import NewsCardListItem from './NewsCardListItem.vue';
import { useDefaultPostsStore } from '../stores/postsStore';

const postsStore = useDefaultPostsStore();
const { posts, isLoading, error } = storeToRefs(postsStore);

onMounted(() => {
  postsStore.fetchPublishedPosts(5);
});

// Format date to German locale
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

// Get excerpt from content (first 150 chars)
function getExcerpt(content: string | null): string {
  if (!content) return '';
  const plainText = content.replace(/<[^>]*>/g, '');
  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText;
}

// Get category name from first category or default
function getCategoryName(categories: { name: string }[]): string {
  return categories.length > 0 ? categories[0].name.toUpperCase() : 'ALLGEMEIN';
}

// Featured post is the first one
const featuredPost = computed(() => posts.value[0] || null);

// Remaining posts for the list (skip first)
const listPosts = computed(() => posts.value.slice(1));
</script>

<template>
  <section class="relative bg-gray-50 py-32">
    <div class="mx-auto max-w-7xl px-6">
      <div class="mb-16 flex flex-col md:flex-row md:items-end md:justify-between">
        <VsgSectionHeader subtitle="Aktuelles" title="NEWS" :centered="false" />
        <VsgLinkArrow href="/news" class="mt-6 md:mt-0"> Alle Neuigkeiten </VsgLinkArrow>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center py-12">
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-vsg-blue-200 border-t-vsg-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="mx-auto max-w-2xl rounded-lg bg-red-50 p-6 text-center">
        <p class="text-red-600">{{ error }}</p>
        <button class="mt-4 rounded bg-vsg-blue-600 px-4 py-2 text-white hover:bg-vsg-blue-700" @click="postsStore.fetchPublishedPosts(5)">
          Erneut versuchen
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="posts.length === 0" class="mx-auto max-w-2xl rounded-lg bg-white p-12 text-center shadow-sm">
        <p class="text-lg text-gray-600">Derzeit sind keine Neuigkeiten verfugbar.</p>
      </div>

      <!-- News Content -->
      <div v-else class="grid gap-8 md:grid-cols-2">
        <!-- Featured News -->
        <NewsCardFeatured
          v-if="featuredPost"
          :category="getCategoryName(featuredPost.categories)"
          :date="formatDate(featuredPost.createdAt)"
          :title="featuredPost.title.toUpperCase()"
          :excerpt="getExcerpt(featuredPost.content)"
          :href="`/news/${featuredPost.slug}`"
        />

        <!-- News List -->
        <div v-if="listPosts.length > 0" class="space-y-6">
          <NewsCardListItem
            v-for="post in listPosts"
            :key="post.id"
            :date="formatDate(post.createdAt)"
            :title="post.title"
            :href="`/news/${post.slug}`"
          />
        </div>
      </div>
    </div>
  </section>
</template>
