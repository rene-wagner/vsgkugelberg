import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = 'http://localhost:3000';

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false);
  const user = ref<User | null>(null);

  async function login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        return false;
      }

      const data = (await response.json()) as { user: User };
      user.value = data.user;
      isAuthenticated.value = true;
      return true;
    } catch {
      return false;
    }
  }

  async function logout(): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } finally {
      user.value = null;
      isAuthenticated.value = false;
    }
  }

  async function checkAuth(): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (response.ok) {
        const data = (await response.json()) as { user: User };
        user.value = data.user;
        isAuthenticated.value = true;
      } else {
        user.value = null;
        isAuthenticated.value = false;
      }
    } catch {
      user.value = null;
      isAuthenticated.value = false;
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
  };
});
