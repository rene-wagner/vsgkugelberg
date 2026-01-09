import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { api, ApiError } from '@shared/utils/api';

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

export interface FlattenedCategory extends Category {
  depth: number;
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
  const isRecalculating = ref(false);
  const error = ref<string | null>(null);
  const successMessage = ref<string | null>(null);

  const flatCategories = computed(() => {
    const result: FlattenedCategory[] = [];
    function flatten(items: Category[], depth = 0): FlattenedCategory[] {
      for (const item of items) {
        result.push({ ...item, depth });
        if (item.children?.length > 0) {
          result.push(...flatten(item.children, depth + 1));
        }
      }
      return result;
    }
    return flatten(categories.value);
  });

  const categoriesByParent = computed(() => {
    const map = new Map<number | null, Category[]>();
    categories.value.forEach((category) => {
      if (!map.has(category.parentId)) {
        map.set(category.parentId, []);
      }
      map.get(category.parentId)!.push(category);
    });
    return map;
  });

  async function fetchCategories(): Promise<void> {
    isLoading.value = true;
    error.value = null;

    try {
      categories.value = await api.get<Category[]>('/api/categories');
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCategory(slug: string): Promise<Category | null> {
    isLoading.value = true;
    error.value = null;

    try {
      return await api.get<Category>(`/api/categories/${slug}`);
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
      const newCategory = await api.post<Category>('/api/categories', data);
      categories.value.push(newCategory);
      return newCategory;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
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
      const updatedCategory = await api.patch<Category>(
        `/api/categories/${slug}`,
        data,
      );
      const index = categories.value.findIndex((c) => c.slug === slug);
      if (index !== -1) {
        categories.value[index] = updatedCategory;
      }
      return updatedCategory;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return null;
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCategory(slug: string): Promise<boolean> {
    isLoading.value = true;
    error.value = null;

    try {
      await api.delete(`/api/categories/${slug}`);
      await fetchCategories();
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function recalculateSlugs(): Promise<boolean> {
    isRecalculating.value = true;
    error.value = null;
    successMessage.value = null;

    try {
      const result = await api.post<{ updated: number }>(
        '/api/categories/recalculate-slugs',
        {},
      );
      successMessage.value = `${result.updated} Kategorien aktualisiert`;
      await fetchCategories();
      return true;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      return false;
    } finally {
      isRecalculating.value = false;
    }
  }

  return {
    categories,
    flatCategories,
    categoriesByParent,
    isLoading,
    isRecalculating,
    error,
    successMessage,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory,
    recalculateSlugs,
  };
});
