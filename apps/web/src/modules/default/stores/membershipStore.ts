import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MembershipContent } from '../../admin/types/membership.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useMembershipStore = defineStore('membership', () => {
  const membership = ref<MembershipContent | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchMembership(): Promise<MembershipContent | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/membership`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch membership content');
      }

      const data = (await response.json()) as MembershipContent;
      membership.value = data;
      return data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    membership,
    isLoading,
    error,
    fetchMembership,
  };
});
