import { ref } from 'vue';
import { defineStore } from 'pinia';
import { fetchPosts as fetchPostsApi, type ApiPost, type PaginationMeta } from '@/utils/apiClient';

export type PublishedFilter = 'all' | 'published' | 'unpublished';

export const usePostsStore = defineStore('posts', () => {
  // State
  const posts = ref<ApiPost[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const meta = ref<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  });

  // Filters
  const publishedFilter = ref<PublishedFilter>('all');
  const categoryFilter = ref('');
  const tagFilter = ref('');

  // Actions
  async function fetchPosts() {
    loading.value = true;
    error.value = null;

    try {
      const filters: {
        published?: boolean;
        category?: string;
        tag?: string;
        page: number;
        limit: number;
      } = {
        page: meta.value.page,
        limit: meta.value.limit,
      };

      // Convert published filter to boolean
      if (publishedFilter.value === 'published') {
        filters.published = true;
      } else if (publishedFilter.value === 'unpublished') {
        filters.published = false;
      }

      // Add category filter if set
      if (categoryFilter.value.trim()) {
        filters.category = categoryFilter.value.trim();
      }

      // Add tag filter if set
      if (tagFilter.value.trim()) {
        filters.tag = tagFilter.value.trim();
      }

      const response = await fetchPostsApi(filters);
      posts.value = response.data;
      meta.value = response.meta;
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch posts';
      posts.value = [];
    } finally {
      loading.value = false;
    }
  }

  function setPublishedFilter(value: PublishedFilter) {
    publishedFilter.value = value;
    meta.value.page = 1; // Reset to first page when filter changes
    fetchPosts();
  }

  function setCategoryFilter(value: string) {
    categoryFilter.value = value;
    meta.value.page = 1; // Reset to first page when filter changes
    fetchPosts();
  }

  function setTagFilter(value: string) {
    tagFilter.value = value;
    meta.value.page = 1; // Reset to first page when filter changes
    fetchPosts();
  }

  function clearFilters() {
    publishedFilter.value = 'all';
    categoryFilter.value = '';
    tagFilter.value = '';
    meta.value.page = 1;
    fetchPosts();
  }

  function setPage(page: number) {
    if (page >= 1 && page <= meta.value.totalPages) {
      meta.value.page = page;
      fetchPosts();
    }
  }

  function nextPage() {
    if (meta.value.page < meta.value.totalPages) {
      setPage(meta.value.page + 1);
    }
  }

  function previousPage() {
    if (meta.value.page > 1) {
      setPage(meta.value.page - 1);
    }
  }

  // Computed-like getters
  const canGoNext = () => meta.value.page < meta.value.totalPages;
  const canGoPrevious = () => meta.value.page > 1;
  const hasFilters = () =>
    publishedFilter.value !== 'all' ||
    categoryFilter.value.trim() !== '' ||
    tagFilter.value.trim() !== '';

  return {
    // State
    posts,
    loading,
    error,
    meta,
    // Filters
    publishedFilter,
    categoryFilter,
    tagFilter,
    // Actions
    fetchPosts,
    setPublishedFilter,
    setCategoryFilter,
    setTagFilter,
    clearFilters,
    setPage,
    nextPage,
    previousPage,
    // Getters
    canGoNext,
    canGoPrevious,
    hasFilters,
  };
});
