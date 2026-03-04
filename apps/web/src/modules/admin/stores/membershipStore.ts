import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { MembershipContent, UpdateMembershipDto } from '../types/membership.types';

export const useAdminMembershipStore = defineStore('adminMembership', () => {
  const membership = ref<MembershipContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchMembership(): Promise<MembershipContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<MembershipContent>('/api/membership');
      membership.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMembership(data: UpdateMembershipDto): Promise<MembershipContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<MembershipContent>('/api/membership/admin', data);
      membership.value = updatedData;
      successMessage.value = 'Mitgliedschaft erfolgreich gespeichert';
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
    membership,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchMembership,
    updateMembership,
    clearMessages,
  };
});
