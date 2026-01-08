import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { HistoryContent, UpdateHistoryDto } from '../types/history.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useHistoryStore = defineStore('history', () => {
  const history = ref<HistoryContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchHistory(): Promise<HistoryContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/history`, {
        method: 'GET',
        credentials: 'include',
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

  async function updateHistory(
    data: UpdateHistoryDto,
  ): Promise<HistoryContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/history/admin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || 'Failed to update history content',
        );
      }

      const updatedData = (await response.json()) as HistoryContent;
      history.value = updatedData;
      successMessage.value = 'Historie erfolgreich gespeichert';
      return updatedData;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isSaving.value = false;
    }
  }

  function clearMessages(): void {
    error.value = null;
    successMessage.value = null;
  }

  return {
    history,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchHistory,
    updateHistory,
    clearMessages,
  };
});
