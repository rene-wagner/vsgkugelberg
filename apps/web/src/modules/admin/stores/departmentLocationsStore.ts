import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { DepartmentLocation, CreateDepartmentLocationDto, UpdateDepartmentLocationDto } from '../types/department-extended.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const useDepartmentLocationsStore = defineStore('departmentLocations', () => {
  const locations = ref<DepartmentLocation[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  function setLocations(newLocations: DepartmentLocation[]): void {
    locations.value = [...newLocations].sort((a, b) => a.sort - b.sort);
  }

  async function createLocation(slug: string, data: CreateDepartmentLocationDto): Promise<DepartmentLocation | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/locations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create location');
      }

      const newLocation = (await response.json()) as DepartmentLocation;
      locations.value.push(newLocation);
      locations.value.sort((a, b) => a.sort - b.sort);
      return newLocation;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateLocation(slug: string, id: number, data: UpdateDepartmentLocationDto): Promise<DepartmentLocation | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/locations/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update location');
      }

      const updatedLocation = (await response.json()) as DepartmentLocation;
      const index = locations.value.findIndex((l) => l.id === id);
      if (index !== -1) {
        locations.value[index] = updatedLocation;
      }
      return updatedLocation;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteLocation(slug: string, id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/locations/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete location');
      }

      locations.value = locations.value.filter((l) => l.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function reorder(slug: string, ids: number[]): Promise<DepartmentLocation[] | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/departments/${slug}/locations/reorder`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ ids }),
      });

      if (!response.ok) {
        throw new Error('Failed to reorder locations');
      }

      const reorderedLocations = (await response.json()) as DepartmentLocation[];
      locations.value = reorderedLocations.sort((a, b) => a.sort - b.sort);
      return reorderedLocations;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  function clearLocations(): void {
    locations.value = [];
    error.value = null;
  }

  return {
    locations,
    isLoading,
    error,
    setLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    reorder,
    clearLocations,
  };
});
