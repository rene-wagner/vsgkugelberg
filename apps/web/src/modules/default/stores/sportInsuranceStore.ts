import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { SportInsuranceContent } from '../../admin/types/sport-insurance.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useSportInsuranceStore = defineStore('default-sportInsurance', () => {
  const sportInsurance = ref<SportInsuranceContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSportInsurance(): Promise<SportInsuranceContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/sport-insurance`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sport insurance content');
      }

      const data = (await response.json()) as SportInsuranceContent;
      sportInsurance.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    sportInsurance,
    isLoading,
    error,
    fetchSportInsurance,
  };
});
