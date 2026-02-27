import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@/shared/utils/api';

export interface Author {
  id: number;
  username: string;
  email: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
}

export interface Thumbnail {
  filename: string;
  originalName: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  published: boolean;
  authorId: number;
  author: Author;
  categories: Category[];
  tags: Tag[];
  thumbnail: Thumbnail | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: Post[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDefaultPostsStore = defineStore('default-posts', () => {
  // List state
  const posts = ref<Post[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // Department posts state (filtered by category)
  const departmentPosts = ref<Post[]>([]);
  const isDepartmentPostsLoading = ref(false);
  const departmentPostsError = ref<string | null>(null);

  // Single post state
  const currentPost = ref<Post | null>(null);
  const currentPostLoading = ref(false);
  const currentPostError = ref<string | null>(null);
  const currentPostNotFound = ref(false);

  async function fetchPublishedPosts(limit = 5): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?published=true&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result = (await response.json()) as PaginatedResponse;
      posts.value = result.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPublishedPostsByCategory(categorySlug: string, limit = 5): Promise<void> {
    isDepartmentPostsLoading.value = true;
    departmentPostsError.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?published=true&category=${encodeURIComponent(categorySlug)}&limit=${limit}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch posts');
      }

      const result = (await response.json()) as PaginatedResponse;
      departmentPosts.value = result.data;
    } catch (e) {
      departmentPostsError.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isDepartmentPostsLoading.value = false;
    }
  }

  function clearDepartmentPosts(): void {
    departmentPosts.value = [];
    isDepartmentPostsLoading.value = false;
    departmentPostsError.value = null;
  }

  async function fetchPostBySlug(slug: string): Promise<void> {
    currentPostLoading.value = true;
    currentPostError.value = null;
    currentPostNotFound.value = false;
    currentPost.value = null;

    try {
      currentPost.value = await api.get<Post>(`/api/posts/${slug}`);
    } catch (e) {
      if (e instanceof ApiError && e.statusCode === 404) {
        currentPostNotFound.value = true;
      } else {
        currentPostError.value = e instanceof Error ? e.message : 'Ein Fehler ist aufgetreten';
      }
    } finally {
      currentPostLoading.value = false;
    }
  }

  function clearCurrentPost(): void {
    currentPost.value = null;
    currentPostLoading.value = false;
    currentPostError.value = null;
    currentPostNotFound.value = false;
  }

  return {
    posts,
    isLoading,
    error,
    fetchPublishedPosts,
    departmentPosts,
    isDepartmentPostsLoading,
    departmentPostsError,
    fetchPublishedPostsByCategory,
    clearDepartmentPosts,
    currentPost,
    currentPostLoading,
    currentPostError,
    currentPostNotFound,
    fetchPostBySlug,
    clearCurrentPost,
  };
});
