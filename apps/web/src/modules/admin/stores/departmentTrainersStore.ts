import { ref } from 'vue';
import { defineStore } from 'pinia';
import type {
  DepartmentTrainer,
  CreateDepartmentTrainerDto,
  UpdateDepartmentTrainerDto,
} from '../types/department-extended.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDepartmentTrainersStore = defineStore(
  'departmentTrainers',
  () => {
    const trainers = ref<DepartmentTrainer[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    function setTrainers(newTrainers: DepartmentTrainer[]): void {
      trainers.value = [...newTrainers].sort((a, b) => a.sort - b.sort);
    }

    async function createTrainer(
      slug: string,
      data: CreateDepartmentTrainerDto,
    ): Promise<DepartmentTrainer | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/trainers`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to create trainer');
        }

        const newTrainer = (await response.json()) as DepartmentTrainer;
        trainers.value.push(newTrainer);
        trainers.value.sort((a, b) => a.sort - b.sort);
        return newTrainer;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function updateTrainer(
      slug: string,
      id: number,
      data: UpdateDepartmentTrainerDto,
    ): Promise<DepartmentTrainer | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/trainers/${id}`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify(data),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to update trainer');
        }

        const updatedTrainer = (await response.json()) as DepartmentTrainer;
        const index = trainers.value.findIndex((t) => t.id === id);
        if (index !== -1) {
          trainers.value[index] = updatedTrainer;
        }
        return updatedTrainer;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    async function deleteTrainer(slug: string, id: number): Promise<boolean> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/trainers/${id}`,
          {
            method: 'DELETE',
            credentials: 'include',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to delete trainer');
        }

        trainers.value = trainers.value.filter((t) => t.id !== id);
        return true;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return false;
      } finally {
        isLoading.value = false;
      }
    }

    async function reorder(
      slug: string,
      ids: number[],
    ): Promise<DepartmentTrainer[] | null> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}/trainers/reorder`,
          {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ ids }),
          },
        );

        if (!response.ok) {
          throw new Error('Failed to reorder trainers');
        }

        const reorderedTrainers =
          (await response.json()) as DepartmentTrainer[];
        trainers.value = reorderedTrainers.sort((a, b) => a.sort - b.sort);
        return reorderedTrainers;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
        return null;
      } finally {
        isLoading.value = false;
      }
    }

    function clearTrainers(): void {
      trainers.value = [];
      error.value = null;
    }

    return {
      trainers,
      isLoading,
      error,
      setTrainers,
      createTrainer,
      updateTrainer,
      deleteTrainer,
      reorder,
      clearTrainers,
    };
  },
);
