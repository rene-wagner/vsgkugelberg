import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { MediaItem } from './mediaStore';
import type { DepartmentExtended } from '../types/department-extended.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchDepartments(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch departments');
      }

      departments.value = (await response.json()) as Department[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDepartment(
    slug: string,
  ): Promise<DepartmentExtended | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch department');
      }

      return (await response.json()) as DepartmentExtended;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createDepartment(
    data: CreateDepartmentData,
  ): Promise<Department | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create department');
      }

      const newDepartment = (await response.json()) as Department;
      departments.value.push(newDepartment);
      return newDepartment;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDepartment(
    slug: string,
    data: UpdateDepartmentData,
  ): Promise<Department | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update department');
      }

      const updatedDepartment = (await response.json()) as Department;
      const index = departments.value.findIndex((d) => d.slug === slug);
      if (index !== -1) {
        departments.value[index] = updatedDepartment;
      }
      return updatedDepartment;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteDepartment(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete department');
      }

      departments.value = departments.value.filter((d) => d.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    departments,
    isLoading,
    error,
    fetchDepartments,
    fetchDepartment,
    createDepartment,
    updateDepartment,
    deleteDepartment,
  };
});
