import { ref } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';

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

export const useContactPersonsStore = defineStore('contactPersons', () => {
  const contactPersons = ref<ContactPerson[]>([]);
  const meta = ref({
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
      const result = await api.get<{
        data: ContactPerson[];
        meta: {
          total: number;
          page: number;
          limit: number;
          totalPages: number;
        };
      }>(`/api/contact-persons?page=${page}&limit=${limit}`);
      contactPersons.value = result.data;
      meta.value = result.meta;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchContactPerson(id: number): Promise<ContactPerson | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<ContactPerson>(`/api/contact-persons/${id}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
      const newContactPerson = await api.post<ContactPerson>(
        '/api/contact-persons',
        data,
      );
      contactPersons.value.push(newContactPerson);
      return newContactPerson;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
      const updatedContactPerson = await api.patch<ContactPerson>(
        `/api/contact-persons/${id}`,
        data,
      );
      const index = contactPersons.value.findIndex((cp) => cp.id === id);
      if (index !== -1) {
        contactPersons.value[index] = updatedContactPerson;
      }
      return updatedContactPerson;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteContactPerson(id: number): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/contact-persons/${id}`);
      contactPersons.value = contactPersons.value.filter((cp) => cp.id !== id);
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
