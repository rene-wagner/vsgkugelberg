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

export interface Thumbnail {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface NewsItem {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  published: boolean;
  authorId: number;
  author: Author;
  categories: Category[];
  thumbnailId: number | null;
  thumbnail: Thumbnail | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNewsData {
  title: string;
  content?: string;
  published?: boolean;
  authorId: number;
  categoryIds?: number[];
  thumbnailId?: number | null;
}

export interface UpdateNewsData {
  title?: string;
  content?: string;
  published?: boolean;
  categoryIds?: number[];
  thumbnailId?: number | null;
}

interface PaginatedResponse {
  data: NewsItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchNews(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts?limit=25`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news');
      }

      const result = (await response.json()) as PaginatedResponse;
      news.value = result.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNewsItem(slug: string): Promise<NewsItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch news item');
      }

      return (await response.json()) as NewsItem;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createNews(data: CreateNewsData): Promise<NewsItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create news item');
      }

      const newNewsItem = (await response.json()) as NewsItem;
      news.value.push(newNewsItem);
      return newNewsItem;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateNews(
    slug: string,
    data: UpdateNewsData,
  ): Promise<NewsItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update news item');
      }

      const updatedNewsItem = (await response.json()) as NewsItem;
      const index = news.value.findIndex((n) => n.slug === slug);
      if (index !== -1) {
        news.value[index] = updatedNewsItem;
      }
      return updatedNewsItem;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteNews(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/posts/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete news item');
      }

      news.value = news.value.filter((n) => n.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    news,
    isLoading,
    error,
    fetchNews,
    fetchNewsItem,
    createNews,
    updateNews,
    deleteNews,
  };
});
