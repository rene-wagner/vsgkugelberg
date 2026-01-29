import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { HomepageContent, UpdateHomepageContentDto } from '../types/homepage-content.types';

export const useHomepageContentStore = defineStore('homepageContent', () => {
  const homepageContent = ref<HomepageContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchHomepageContent(): Promise<HomepageContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<HomepageContent>('/api/homepage-content');
      homepageContent.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateHomepageContent(data: UpdateHomepageContentDto): Promise<HomepageContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<HomepageContent>('/api/homepage-content', data);
      homepageContent.value = updatedData;
      successMessage.value = 'Startseiten-Inhalt erfolgreich gespeichert';
      return updatedData;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Ein Fehler ist aufgetreten';
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
    homepageContent,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchHomepageContent,
    updateHomepageContent,
    clearMessages,
  };
});
