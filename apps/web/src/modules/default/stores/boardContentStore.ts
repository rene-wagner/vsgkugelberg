import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { BoardContent } from '../types/board-content.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useBoardContentStore = defineStore('boardContent', () => {
  const boardContent = ref<BoardContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchBoardContent(): Promise<BoardContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/board-content`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch board content');
      }

      const data = (await response.json()) as BoardContent;
      boardContent.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    boardContent,
    isLoading,
    error,
    fetchBoardContent,
  };
});
