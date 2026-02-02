import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { MembershipFeeContent, UpdateMembershipFeeDto } from '../types/membership-fee.types';

export const useMembershipFeeStore = defineStore('membershipFee', () => {
  const membershipFee = ref<MembershipFeeContent | null>(null);
  const isLoading = ref(false);
  const isSaving = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  async function fetchMembershipFee(): Promise<MembershipFeeContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const data = await api.get<MembershipFeeContent>('/api/membership-fee');
      membershipFee.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'Ein Fehler ist aufgetreten';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateMembershipFee(data: UpdateMembershipFeeDto): Promise<MembershipFeeContent | null> {
    isSaving.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const updatedData = await api.patch<MembershipFeeContent>('/api/membership-fee/admin', data);
      membershipFee.value = updatedData;
      successMessage.value = 'Beitragsordnung erfolgreich gespeichert';
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
    membershipFee,
    isLoading,
    isSaving,
    error,
    successMessage,
    fetchMembershipFee,
    updateMembershipFee,
    clearMessages,
  };
});
