import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface User {
  id: number;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserData {
  username: string;
  email: string;
  password: string;
}

export interface UpdateUserData {
  username?: string;
  email?: string;
  password?: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedResponse {
  data: User[];
  meta: PaginationMeta;
}

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const meta = ref<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchUsers(page = 1, limit = 25): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/users?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const result = (await response.json()) as PaginatedResponse;
      users.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUser(id: number): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      return (await response.json()) as User;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(data: CreateUserData): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create user');
      }

      const newUser = (await response.json()) as User;
      users.value.push(newUser);
      return newUser;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(
    id: number,
    data: UpdateUserData,
  ): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const updatedUser = (await response.json()) as User;
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      users.value = users.value.filter((u) => u.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    users,
    meta,
    isLoading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
  };
});
