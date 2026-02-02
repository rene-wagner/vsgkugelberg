import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { StatutesContent } from '../../admin/types/statutes.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useStatutesStore = defineStore('default-statutes', () => {
  const statutes = ref<StatutesContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchStatutes(): Promise<StatutesContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/statutes`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch statutes content');
      }

      const data = (await response.json()) as StatutesContent;
      statutes.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    statutes,
    isLoading,
    error,
    fetchStatutes,
  };
});
