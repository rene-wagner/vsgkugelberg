import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { StatutesContent, UpdateStatutesDto } from '../types/statutes.types';

export const useStatutesStore = defineStore('statutes', () => {
  const statutes = ref<StatutesContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchStatutes(): Promise<StatutesContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<StatutesContent>('/api/statutes');
      statutes.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStatutes(data: UpdateStatutesDto): Promise<StatutesContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<StatutesContent>('/api/statutes/admin', data);
      statutes.value = updatedData;
      successMessage.value = 'Satzung erfolgreich gespeichert';
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
    statutes,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchStatutes,
    updateStatutes,
    clearMessages,
  };
});
