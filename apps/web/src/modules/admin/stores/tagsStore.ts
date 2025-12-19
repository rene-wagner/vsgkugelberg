import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Tag {
  id: number;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagData {
  name: string;
}

export interface UpdateTagData {
  name?: string;
}

export const useTagsStore = defineStore('tags', () => {
  const tags = ref<Tag[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchTags(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tags');
      }

      tags.value = (await response.json()) as Tag[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchTag(slug: string): Promise<Tag | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tags/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tag');
      }

      return (await response.json()) as Tag;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createTag(data: CreateTagData): Promise<Tag | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tags`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create tag');
      }

      const newTag = (await response.json()) as Tag;
      tags.value.push(newTag);
      return newTag;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateTag(
    slug: string,
    data: UpdateTagData,
  ): Promise<Tag | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tags/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update tag');
      }

      const updatedTag = (await response.json()) as Tag;
      const index = tags.value.findIndex((t) => t.slug === slug);
      if (index !== -1) {
        tags.value[index] = updatedTag;
      }
      return updatedTag;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteTag(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/tags/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete tag');
      }

      tags.value = tags.value.filter((t) => t.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    fetchTag,
    createTag,
    updateTag,
    deleteTag,
  };
});
