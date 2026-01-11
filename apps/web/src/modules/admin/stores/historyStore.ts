import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { HistoryContent, UpdateHistoryDto } from '../types/history.types';

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
      const data = await api.get<HistoryContent>('/api/history');
      history.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateHistory(data: UpdateHistoryDto): Promise<HistoryContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<HistoryContent>('/api/history/admin', data);
      history.value = updatedData;
      successMessage.value = 'Historie erfolgreich gespeichert';
      return updatedData;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
