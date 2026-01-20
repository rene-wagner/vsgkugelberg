import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ClubSettings {
  id: number;
  address: string | null;
  memberCount: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  updatedAt: string;
}

export interface UpdateSettingsData {
  address?: string | null;
  memberCount?: number | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<ClubSettings | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchSettings(): Promise<ClubSettings | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      settings.value = (await response.json()) as ClubSettings;
      return settings.value;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSettings(data: UpdateSettingsData): Promise<ClubSettings | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/settings`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update settings');
      }

      settings.value = (await response.json()) as ClubSettings;
      successMessage.value = 'Einstellungen erfolgreich gespeichert';
      return settings.value;
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
    settings,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchSettings,
    updateSettings,
    clearMessages,
  };
});
