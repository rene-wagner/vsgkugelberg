import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Department {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  createdAt: string;
  updatedAt: string;
}

export const useDefaultDepartmentsStore = defineStore(
  'default-departments',
  () => {
    const departments = ref<Department[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    async function fetchDepartments(): Promise<void> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(`${API_BASE_URL}/api/departments`, {
          method: 'GET',
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

    return {
      departments,
      isLoading,
      error,
      fetchDepartments,
    };
  },
);
