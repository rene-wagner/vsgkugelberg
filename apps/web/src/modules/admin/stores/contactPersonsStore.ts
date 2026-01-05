import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Media {
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

export interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  email: string | null;
  address: string | null;
  phone: string;
  profileImageId: number | null;
  profileImage: Media | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContactPersonData {
  firstName: string;
  lastName: string;
  type: string;
  email?: string;
  address?: string;
  phone: string;
  profileImageId?: number;
}

export interface UpdateContactPersonData {
  firstName?: string;
  lastName?: string;
  type?: string;
  email?: string;
  address?: string;
  phone?: string;
  profileImageId?: number | null;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface PaginatedResponse {
  data: ContactPerson[];
  meta: PaginationMeta;
}

export const useContactPersonsStore = defineStore('contactPersons', () => {
  const contactPersons = ref<ContactPerson[]>([]);
  const meta = ref<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 25,
    totalPages: 0,
  });
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchContactPersons(page = 1, limit = 25): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact-persons?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contact persons');
      }

      const result = (await response.json()) as PaginatedResponse;
      contactPersons.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchContactPerson(id: number): Promise<ContactPerson | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact-persons/${id}`,
        {
          method: 'GET',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to fetch contact person');
      }

      return (await response.json()) as ContactPerson;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createContactPerson(
    data: CreateContactPersonData,
  ): Promise<ContactPerson | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact-persons`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create contact person');
      }

      const newContactPerson = (await response.json()) as ContactPerson;
      contactPersons.value.push(newContactPerson);
      return newContactPerson;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateContactPerson(
    id: number,
    data: UpdateContactPersonData,
  ): Promise<ContactPerson | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact-persons/${id}`,
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
        throw new Error('Failed to update contact person');
      }

      const updatedContactPerson = (await response.json()) as ContactPerson;
      const index = contactPersons.value.findIndex((cp) => cp.id === id);
      if (index !== -1) {
        contactPersons.value[index] = updatedContactPerson;
      }
      return updatedContactPerson;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteContactPerson(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/contact-persons/${id}`,
        {
          method: 'DELETE',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Failed to delete contact person');
      }

      contactPersons.value = contactPersons.value.filter((cp) => cp.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    contactPersons,
    meta,
    isLoading,
    error,
    fetchContactPersons,
    fetchContactPerson,
    createContactPerson,
    updateContactPerson,
    deleteContactPerson,
  };
});
