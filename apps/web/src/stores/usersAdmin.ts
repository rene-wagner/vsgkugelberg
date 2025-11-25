import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchUsers as fetchUsersApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
  type ApiUser,
  type CreateUserPayload,
  type UpdateUserPayload,
} from '@/utils/apiClient';

export const useUsersAdminStore = defineStore('usersAdmin', () => {
  // State
  const users = ref<ApiUser[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Create user state
  const creating = ref(false);
  const createError = ref<string | null>(null);

  // Update user state
  const selectedUser = ref<ApiUser | null>(null);
  const updating = ref(false);
  const updateError = ref<string | null>(null);

  // Delete user state
  const deleting = ref(false);
  const deleteError = ref<string | null>(null);

  // Actions
  async function fetchUsers() {
    loading.value = true;
    error.value = null;

    try {
      users.value = await fetchUsersApi();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch users';
      users.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createUser(payload: CreateUserPayload): Promise<boolean> {
    creating.value = true;
    createError.value = null;

    try {
      await createUserApi(payload);
      // Refresh users list
      await fetchUsers();
      return true;
    } catch (err) {
      createError.value = err instanceof Error ? err.message : 'Failed to create user';
      return false;
    } finally {
      creating.value = false;
    }
  }

  function clearCreateError() {
    createError.value = null;
  }

  async function updateUser(id: number, payload: UpdateUserPayload): Promise<boolean> {
    updating.value = true;
    updateError.value = null;

    try {
      await updateUserApi(id, payload);
      // Refresh users list
      await fetchUsers();
      return true;
    } catch (err) {
      updateError.value = err instanceof Error ? err.message : 'Failed to update user';
      return false;
    } finally {
      updating.value = false;
    }
  }

  async function deleteUser(id: number): Promise<boolean> {
    deleting.value = true;
    deleteError.value = null;

    try {
      await deleteUserApi(id);
      // Refresh users list
      await fetchUsers();
      return true;
    } catch (err) {
      deleteError.value = err instanceof Error ? err.message : 'Failed to delete user';
      return false;
    } finally {
      deleting.value = false;
    }
  }

  function selectUser(user: ApiUser | null) {
    selectedUser.value = user;
  }

  function clearUpdateError() {
    updateError.value = null;
  }

  function clearDeleteError() {
    deleteError.value = null;
  }

  return {
    // State
    users,
    loading,
    error,
    // Create user state
    creating,
    createError,
    // Update user state
    selectedUser,
    updating,
    updateError,
    // Delete user state
    deleting,
    deleteError,
    // Actions
    fetchUsers,
    createUser,
    clearCreateError,
    updateUser,
    deleteUser,
    selectUser,
    clearUpdateError,
    clearDeleteError,
  };
});
