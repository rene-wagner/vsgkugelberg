import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchDepartments as fetchDepartmentsApi,
  createDepartment as createDepartmentApi,
  updateDepartment as updateDepartmentApi,
  deleteDepartment as deleteDepartmentApi,
  type ApiDepartment,
  type CreateDepartmentPayload,
  type UpdateDepartmentPayload,
} from '@/utils/apiClient';

export const useDepartmentsStore = defineStore('departments', () => {
  // State
  const departments = ref<ApiDepartment[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Create department state
  const creating = ref(false);
  const createError = ref<string | null>(null);

  // Update department state
  const selectedDepartment = ref<ApiDepartment | null>(null);
  const updating = ref(false);
  const updateError = ref<string | null>(null);

  // Delete department state
  const deleting = ref(false);
  const deleteError = ref<string | null>(null);

  // Actions
  async function fetchDepartments() {
    loading.value = true;
    error.value = null;

    try {
      departments.value = await fetchDepartmentsApi();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch departments';
      departments.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createDepartment(payload: CreateDepartmentPayload): Promise<boolean> {
    creating.value = true;
    createError.value = null;

    try {
      await createDepartmentApi(payload);
      // Refresh departments list
      await fetchDepartments();
      return true;
    } catch (err) {
      createError.value = err instanceof Error ? err.message : 'Failed to create department';
      return false;
    } finally {
      creating.value = false;
    }
  }

  function clearCreateError() {
    createError.value = null;
  }

  async function updateDepartment(
    slug: string,
    payload: UpdateDepartmentPayload
  ): Promise<boolean> {
    updating.value = true;
    updateError.value = null;

    try {
      await updateDepartmentApi(slug, payload);
      // Refresh departments list
      await fetchDepartments();
      return true;
    } catch (err) {
      updateError.value = err instanceof Error ? err.message : 'Failed to update department';
      return false;
    } finally {
      updating.value = false;
    }
  }

  async function deleteDepartment(slug: string): Promise<boolean> {
    deleting.value = true;
    deleteError.value = null;

    try {
      await deleteDepartmentApi(slug);
      // Refresh departments list
      await fetchDepartments();
      return true;
    } catch (err) {
      deleteError.value = err instanceof Error ? err.message : 'Failed to delete department';
      return false;
    } finally {
      deleting.value = false;
    }
  }

  function selectDepartment(department: ApiDepartment | null) {
    selectedDepartment.value = department;
  }

  function clearUpdateError() {
    updateError.value = null;
  }

  function clearDeleteError() {
    deleteError.value = null;
  }

  return {
    // State
    departments,
    loading,
    error,
    // Create department state
    creating,
    createError,
    // Update department state
    selectedDepartment,
    updating,
    updateError,
    // Delete department state
    deleting,
    deleteError,
    // Actions
    fetchDepartments,
    createDepartment,
    clearCreateError,
    updateDepartment,
    deleteDepartment,
    selectDepartment,
    clearUpdateError,
    clearDeleteError,
  };
});
