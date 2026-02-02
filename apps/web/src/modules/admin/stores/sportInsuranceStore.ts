import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { SportInsuranceContent, UpdateSportInsuranceDto } from '../types/sport-insurance.types';

export const useSportInsuranceStore = defineStore('sportInsurance', () => {
  const sportInsurance = ref<SportInsuranceContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchSportInsurance(): Promise<SportInsuranceContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<SportInsuranceContent>('/api/sport-insurance');
      sportInsurance.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSportInsurance(data: UpdateSportInsuranceDto): Promise<SportInsuranceContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<SportInsuranceContent>('/api/sport-insurance/admin', data);
      sportInsurance.value = updatedData;
      successMessage.value = 'Sportversicherung erfolgreich gespeichert';
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
    sportInsurance,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchSportInsurance,
    updateSportInsurance,
    clearMessages,
  };
});
