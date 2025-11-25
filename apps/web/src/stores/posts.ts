import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchPosts as fetchPostsApi,
  createPost as createPostApi,
  updatePost as updatePostApi,
  deletePost as deletePostApi,
  type ApiPost,
  type PaginationMeta,
  type CreatePostPayload,
  type UpdatePostPayload,
} from '@/utils/apiClient';

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

  // Create post state
  const creating = ref(false);
  const createError = ref<string | null>(null);

  // Update post state
  const selectedPost = ref<ApiPost | null>(null);
  const updating = ref(false);
  const updateError = ref<string | null>(null);

  // Delete post state
  const deleting = ref(false);
  const deleteError = ref<string | null>(null);

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

  async function createPost(payload: CreatePostPayload): Promise<boolean> {
    creating.value = true;
    createError.value = null;

    try {
      await createPostApi(payload);
      // Reset to first page and refresh posts list
      meta.value.page = 1;
      await fetchPosts();
      return true;
    } catch (err) {
      createError.value = err instanceof Error ? err.message : 'Failed to create post';
      return false;
    } finally {
      creating.value = false;
    }
  }

  function clearCreateError() {
    createError.value = null;
  }

  async function updatePost(slug: string, payload: UpdatePostPayload): Promise<boolean> {
    updating.value = true;
    updateError.value = null;

    try {
      await updatePostApi(slug, payload);
      // Refresh posts list
      await fetchPosts();
      return true;
    } catch (err) {
      updateError.value = err instanceof Error ? err.message : 'Failed to update post';
      return false;
    } finally {
      updating.value = false;
    }
  }

  async function deletePost(slug: string): Promise<boolean> {
    deleting.value = true;
    deleteError.value = null;

    try {
      await deletePostApi(slug);
      // Refresh posts list
      await fetchPosts();
      return true;
    } catch (err) {
      deleteError.value = err instanceof Error ? err.message : 'Failed to delete post';
      return false;
    } finally {
      deleting.value = false;
    }
  }

  function selectPost(post: ApiPost | null) {
    selectedPost.value = post;
  }

  function clearUpdateError() {
    updateError.value = null;
  }

  function clearDeleteError() {
    deleteError.value = null;
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
    // Create post state
    creating,
    createError,
    // Update post state
    selectedPost,
    updating,
    updateError,
    // Delete post state
    deleting,
    deleteError,
    // Filters
    publishedFilter,
    categoryFilter,
    tagFilter,
    // Actions
    fetchPosts,
    createPost,
    clearCreateError,
    updatePost,
    deletePost,
    selectPost,
    clearUpdateError,
    clearDeleteError,
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
