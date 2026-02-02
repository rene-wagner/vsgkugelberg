import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MembershipFeeContent } from '../../admin/types/membership-fee.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useMembershipFeeStore = defineStore('default-membershipFee', () => {
  const membershipFee = ref<MembershipFeeContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMembershipFee(): Promise<MembershipFeeContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/membership-fee`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch membership fee content');
      }

      const data = (await response.json()) as MembershipFeeContent;
      membershipFee.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    membershipFee,
    isLoading,
    error,
    fetchMembershipFee,
  };
});
