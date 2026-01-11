import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';
import type { MediaItem } from './mediaStore';
import type { DepartmentExtended } from '../types/department-extended.types';

export interface Department {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  iconId: number | null;
  icon: MediaItem | null;
  createdAt: string;
  updatedAt: string;
}

// Re-export the extended type for consumers
export type { DepartmentExtended };

export interface CreateDepartmentData {
  name: string;
  shortDescription: string;
  iconId?: number;
}

export interface UpdateDepartmentData {
  name?: string;
  shortDescription?: string;
  iconId?: number | null;
}

export const useDepartmentsStore = defineStore('departments', () => {
  const departments = ref<Department[]>([]);
  const meta = ref({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDepartments(page = 1, limit = 25): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const result = await api.get<{
        data: Department[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/departments?page=${page}&limit=${limit}`);
      departments.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDepartment(slug: string): Promise<DepartmentExtended | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<DepartmentExtended>(`/api/departments/${slug}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createDepartment(data: CreateDepartmentData): Promise<Department | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const newDepartment = await api.post<Department>('/api/departments', data);
      departments.value.push(newDepartment);
      return newDepartment;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDepartment(slug: string, data: UpdateDepartmentData): Promise<Department | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const updatedDepartment = await api.patch<Department>(`/api/departments/${slug}`, data);
      const index = departments.value.findIndex((d) => d.slug === slug);
      if (index !== -1) {
        departments.value[index] = updatedDepartment;
      }
      return updatedDepartment;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteDepartment(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/departments/${slug}`);
      departments.value = departments.value.filter((d) => d.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    departments,
    meta,
    isLoading,
    error,
    fetchDepartments,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
