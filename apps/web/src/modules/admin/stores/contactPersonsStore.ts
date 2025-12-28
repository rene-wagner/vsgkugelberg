import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface ContactPerson {
  id: number;
  firstName: string;
  lastName: string;
  type: string;
  email: string | null;
  address: string | null;
  phone: string;
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
}

export interface UpdateContactPersonData {
  firstName?: string;
  lastName?: string;
  type?: string;
  email?: string;
  address?: string;
  phone?: string;
}

export const useContactPersonsStore = defineStore('contactPersons', () => {
  const contactPersons = ref<ContactPerson[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchContactPersons(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/contact-persons`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch contact persons');
      }

      contactPersons.value = (await response.json()) as ContactPerson[];
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
    isLoading,
    error,
    fetchContactPersons,
    fetchContactPerson,
    createContactPerson,
    updateContactPerson,
    deleteContactPerson,
  };
});
