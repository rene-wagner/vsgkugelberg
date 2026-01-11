import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { DepartmentStat, CreateDepartmentStatDto, UpdateDepartmentStatDto } from '../types/department-extended.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDepartmentStatsStore = defineStore('departmentStats', () => {
  const stats = ref<DepartmentStat[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setStats(newStats: DepartmentStat[]): void {
    stats.value = [...newStats].sort((a, b) => a.sort - b.sort);
  }

  async function createStat(slug: string, data: CreateDepartmentStatDto): Promise<DepartmentStat | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/stats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create stat');
      }

      const newStat = (await response.json()) as DepartmentStat;
      stats.value.push(newStat);
      stats.value.sort((a, b) => a.sort - b.sort);
      return newStat;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateStat(slug: string, id: number, data: UpdateDepartmentStatDto): Promise<DepartmentStat | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/stats/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update stat');
      }

      const updatedStat = (await response.json()) as DepartmentStat;
      const index = stats.value.findIndex((s) => s.id === id);
      if (index !== -1) {
        stats.value[index] = updatedStat;
      }
      return updatedStat;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteStat(slug: string, id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/stats/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete stat');
      }

      stats.value = stats.value.filter((s) => s.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function reorder(slug: string, ids: number[]): Promise<DepartmentStat[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/stats/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder stats');
      }

      const reorderedStats = (await response.json()) as DepartmentStat[];
      stats.value = reorderedStats.sort((a, b) => a.sort - b.sort);
      return reorderedStats;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  function clearStats(): void {
    stats.value = [];
    error.value = null;
  }

  return {
    stats,
    isLoading,
    error,
    setStats,
    createStat,
    updateStat,
    deleteStat,
    reorder,
    clearStats,
  };
});
