import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ThumbnailsMap {
  thumb?: string;
  small?: string;
  medium?: string;
  large?: string;
}

export interface Media {
  id: number;
  filename: string;
  originalName: string;
  path: string;
  mimetype: string;
  size: number;
  type: string;
  thumbnails?: ThumbnailsMap | null;
  createdAt: string;
  updatedAt: string;
}

export interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  address: string | null;
  phone: string;
  profileImageId: number | null;
  profileImage: Media | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  data: ContactPerson[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useDefaultContactPersonsStore = defineStore('default-contact-persons', () => {
  const contactPersons = ref<ContactPerson[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchContactPersons(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact-persons?limit=50`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact persons');
      }

      const result = (await response.json()) as PaginatedResponse;
      contactPersons.value = result.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  return {
    contactPersons,
    isLoading,
    error,
    fetchContactPersons,
  };
});
