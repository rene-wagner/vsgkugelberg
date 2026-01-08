import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { HistoryContent } from '../../admin/types/history.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchHistory(): Promise<HistoryContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch history content');
      }

      const data = (await response.json()) as HistoryContent;
      history.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    history,
    isLoading,
    error,
    fetchHistory,
  };
});
