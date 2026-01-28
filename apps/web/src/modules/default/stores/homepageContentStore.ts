import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { HomepageContent } from '../../../shared/types/homepage-content.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useHomepageContentStore = defineStore('homepageContent', () => {
  const homepageContent = ref<HomepageContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchHomepageContent(): Promise<HomepageContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/homepage-content`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch homepage content');
      }

      const data = (await response.json()) as HomepageContent;
      homepageContent.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    homepageContent,
    isLoading,
    error,
    fetchHomepageContent,
  };
});
