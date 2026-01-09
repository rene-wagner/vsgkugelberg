import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';

export interface Author {
  id: number;
  username: string;
  email: string;
}

export interface NewsCategory {
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
  categories: NewsCategory[];
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

export const useNewsStore = defineStore('news', () => {
  const news = ref<NewsItem[]>([]);
  const meta = ref({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchNews(page = 1, limit = 25): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await api.get<{
        data: NewsItem[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/posts?page=${page}&limit=${limit}`);
      news.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchNewsItem(slug: string): Promise<NewsItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<NewsItem>(`/api/posts/${slug}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createNews(data: CreateNewsData): Promise<NewsItem | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const newNewsItem = await api.post<NewsItem>('/api/posts', data);
      news.value.push(newNewsItem);
      return newNewsItem;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
      const updatedNewsItem = await api.patch<NewsItem>(
        `/api/posts/${slug}`,
        data,
      );
      const index = news.value.findIndex((n) => n.slug === slug);
      if (index !== -1) {
        news.value[index] = updatedNewsItem;
      }
      return updatedNewsItem;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteNews(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/posts/${slug}`);
      news.value = news.value.filter((n) => n.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    news,
    meta,
    isLoading,
    error,
    fetchNews,
    fetchNewsItem,
    createNews,
    updateNews,
    deleteNews,
  };
});
