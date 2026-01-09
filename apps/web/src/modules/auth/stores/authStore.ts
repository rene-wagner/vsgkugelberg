import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: number;
  username: string;
  email: string;
  permissions?: string[];
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

  /**
   * Request a password reset email.
   * Always returns success to prevent user enumeration.
   */
  async function requestPasswordReset(
    email: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { message: string };
      return { success: true, message: data.message };
    } catch {
      return {
        success: false,
        message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      };
    }
  }

  /**
   * Reset password with a valid token.
   */
  async function resetPassword(
    token: string,
    password: string,
  ): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as { message: string };

      if (!response.ok) {
        return { success: false, message: data.message };
      }

      return { success: true, message: data.message };
    } catch {
      return {
        success: false,
        message: 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.',
      };
    }
  }

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth,
    requestPasswordReset,
    resetPassword,
  };
});
