import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';

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

export const useUsersStore = defineStore('users', () => {
  const users = ref<User[]>([]);
  const meta = ref({
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
      const result = await api.get<{
        data: User[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/users?page=${page}&limit=${limit}`);
      users.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchUser(id: number): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<User>(`/api/users/${id}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createUser(data: CreateUserData): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const newUser = await api.post<User>('/api/users', data);
      users.value.push(newUser);
      return newUser;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateUser(id: number, data: UpdateUserData): Promise<User | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedUser = await api.patch<User>(`/api/users/${id}`, data);
      const index = users.value.findIndex((u) => u.id === id);
      if (index !== -1) {
        users.value[index] = updatedUser;
      }
      return updatedUser;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/users/${id}`);
      users.value = users.value.filter((u) => u.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
