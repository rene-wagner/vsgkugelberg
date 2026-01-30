import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { BoardContent, UpdateBoardContentDto } from '../types/board-content.types';

export const useBoardContentStore = defineStore('boardContent', () => {
  const boardContent = ref<BoardContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchBoardContent(): Promise<BoardContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<BoardContent>('/api/board-content');
      boardContent.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateBoardContent(data: UpdateBoardContentDto): Promise<BoardContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<BoardContent>('/api/board-content/admin', data);
      boardContent.value = updatedData;
      successMessage.value = 'Vorstand erfolgreich gespeichert';
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
    boardContent,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchBoardContent,
    updateBoardContent,
    clearMessages,
  };
});
