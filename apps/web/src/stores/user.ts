import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import type { ApiUser } from '@/utils/apiClient';

export const useUserStore = defineStore('user', () => {
  const user = ref<ApiUser | null>(null);

  const isAuthenticated = computed(() => user.value !== null);

  const username = computed(() => user.value?.username ?? '');

  const setUser = (value: ApiUser) => {
    user.value = value;
  };

  const clearUser = () => {
    user.value = null;
  };

  return {
    user,
    isAuthenticated,
    username,
    setUser,
    clearUser,
  };
});
