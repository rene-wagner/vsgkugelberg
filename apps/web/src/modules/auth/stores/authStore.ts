import { ref } from 'vue';
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const token = ref<string | null>(null);

  async function login(email: string, password: string) {
    // TODO: Implement actual API call to backend
    // For now, simulate a successful login
    if (email && password) {
      token.value = 'mock-jwt-token';
      isAuthenticated.value = true;
      return true;
    }
    return false;
  }

  function logout() {
    token.value = null;
    isAuthenticated.value = false;
  }

  return {
    isAuthenticated,
    token,
    login,
    logout,
  };
});
