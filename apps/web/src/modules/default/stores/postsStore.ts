import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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

export const useDefaultPostsStore = defineStore('default-posts', () => {
  const posts = ref<Post[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

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

  return {
    posts,
    isLoading,
    error,
    fetchPublishedPosts,
  };
});
