import { ref } from 'vue';
import { defineStore } from 'pinia';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export interface Category {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  children: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description?: string;
  parentId?: number;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  parentId?: number | null;
}

export const useCategoriesStore = defineStore('categories', () => {
  const categories = ref<Category[]>([]);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCategories(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }

      categories.value = (await response.json()) as Category[];
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCategory(slug: string): Promise<Category | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${slug}`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch category');
      }

      return (await response.json()) as Category;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function createCategory(
    data: CreateCategoryData,
  ): Promise<Category | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      const newCategory = (await response.json()) as Category;
      categories.value.push(newCategory);
      return newCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCategory(
    slug: string,
    data: UpdateCategoryData,
  ): Promise<Category | null> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${slug}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const updatedCategory = (await response.json()) as Category;
      const index = categories.value.findIndex((c) => c.slug === slug);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCategory(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/categories/${slug}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      categories.value = categories.value.filter((c) => c.slug !== slug);
      return true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    categories,
    isLoading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
  };
});
