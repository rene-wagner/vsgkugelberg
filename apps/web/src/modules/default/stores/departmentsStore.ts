import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface MediaItem {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentStat {
  id: number;
  label: string;
  value: string;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTrainingSession {
  id: number;
  day: string;
  time: string;
  locationId: number | null;
  location: DepartmentLocation | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentTrainingGroup {
  id: number;
  name: string;
  ageRange: string | null;
  icon: string;
  variant: string;
  sort: number;
  sessions: DepartmentTrainingSession[];
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentLocation {
  id: number;
  name: string;
  badge: string;
  badgeVariant: string;
  street: string;
  city: string;
  mapsUrl: string | null;
  amenities: any;
  imageId: number | null;
  image: MediaItem | null;
  sort: number;
  createdAt: string;
  updatedAt: string;
}

export interface TrainerLicense {
  name: string;
  variant: string;
}

export interface DepartmentTrainer {
  id: number;
  contactPersonId: number;
  role: string;
  licenses: any;
  sort: number;
  createdAt: string;
  updatedAt: string;
  contactPerson: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    profileImage: MediaItem | null;
  };
}

export interface Department {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  iconId: number | null;
  icon: MediaItem | null;
  stats: DepartmentStat[];
  trainingGroups: DepartmentTrainingGroup[];
  locations: DepartmentLocation[];
  trainers: DepartmentTrainer[];
  createdAt: string;
  updatedAt: string;
}

export function getMediaUrl(item: MediaItem): string {
  return `${API_BASE_URL}/uploads/${item.filename}`;
}

interface PaginatedResponse {
  data: Department[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useDefaultDepartmentsStore = defineStore(
  'default-departments',
  () => {
    // List state
    const departments = ref<Department[]>([]);
    const isLoading = ref(false);
    const error = ref<string | null>(null);

    // Single department state
    const currentDepartment = ref<Department | null>(null);
    const currentDepartmentLoading = ref(false);
    const currentDepartmentError = ref<string | null>(null);
    const currentDepartmentNotFound = ref(false);

    async function fetchDepartments(): Promise<void> {
      isLoading.value = true;
      error.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments?limit=100`,
          {
            method: 'GET',
          },
        );

        if (!response.ok) {
          throw new Error('Failed to fetch departments');
        }

        const result = (await response.json()) as PaginatedResponse;
        departments.value = result.data;
      } catch (e) {
        error.value = e instanceof Error ? e.message : 'An error occurred';
      } finally {
        isLoading.value = false;
      }
    }

    async function fetchDepartmentBySlug(slug: string): Promise<void> {
      currentDepartmentLoading.value = true;
      currentDepartmentError.value = null;
      currentDepartmentNotFound.value = false;
      currentDepartment.value = null;

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/departments/${slug}`,
          {
            method: 'GET',
          },
        );

        if (response.status === 404) {
          currentDepartmentNotFound.value = true;
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch department');
        }

        currentDepartment.value = (await response.json()) as Department;
      } catch (e) {
        currentDepartmentError.value =
          e instanceof Error ? e.message : 'An error occurred';
      } finally {
        currentDepartmentLoading.value = false;
      }
    }

    function clearCurrentDepartment(): void {
      currentDepartment.value = null;
      currentDepartmentError.value = null;
      currentDepartmentNotFound.value = false;
    }

    return {
      // List state
      departments,
      isLoading,
      error,
      fetchDepartments,
      // Single department state
      currentDepartment,
      currentDepartmentLoading,
      currentDepartmentError,
      currentDepartmentNotFound,
      fetchDepartmentBySlug,
      clearCurrentDepartment,
    };
  },
);
