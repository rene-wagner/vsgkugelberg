import { ref } from 'vue';
import { defineStore } from 'pinia';
import {
  fetchCategories as fetchCategoriesApi,
  createCategory as createCategoryApi,
  updateCategory as updateCategoryApi,
  deleteCategory as deleteCategoryApi,
  type ApiCategoryFull,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
} from '@/utils/apiClient';

export const useCategoriesStore = defineStore('categories', () => {
  // State
  const categories = ref<ApiCategoryFull[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Create category state
  const creating = ref(false);
  const createError = ref<string | null>(null);

  // Update category state
  const selectedCategory = ref<ApiCategoryFull | null>(null);
  const updating = ref(false);
  const updateError = ref<string | null>(null);

  // Delete category state
  const deleting = ref(false);
  const deleteError = ref<string | null>(null);

  // Actions
  async function fetchCategories() {
    loading.value = true;
    error.value = null;

    try {
      categories.value = await fetchCategoriesApi();
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch categories';
      categories.value = [];
    } finally {
      loading.value = false;
    }
  }

  async function createCategory(payload: CreateCategoryPayload): Promise<boolean> {
    creating.value = true;
    createError.value = null;

    try {
      await createCategoryApi(payload);
      // Refresh categories list
      await fetchCategories();
      return true;
    } catch (err) {
      createError.value = err instanceof Error ? err.message : 'Failed to create category';
      return false;
    } finally {
      creating.value = false;
    }
  }

  function clearCreateError() {
    createError.value = null;
  }

  async function updateCategory(slug: string, payload: UpdateCategoryPayload): Promise<boolean> {
    updating.value = true;
    updateError.value = null;

    try {
      await updateCategoryApi(slug, payload);
      // Refresh categories list
      await fetchCategories();
      return true;
    } catch (err) {
      updateError.value = err instanceof Error ? err.message : 'Failed to update category';
      return false;
    } finally {
      updating.value = false;
    }
  }

  async function deleteCategory(slug: string): Promise<boolean> {
    deleting.value = true;
    deleteError.value = null;

    try {
      await deleteCategoryApi(slug);
      // Refresh categories list
      await fetchCategories();
      return true;
    } catch (err) {
      deleteError.value = err instanceof Error ? err.message : 'Failed to delete category';
      return false;
    } finally {
      deleting.value = false;
    }
  }

  function selectCategory(category: ApiCategoryFull | null) {
    selectedCategory.value = category;
  }

  function clearUpdateError() {
    updateError.value = null;
  }

  function clearDeleteError() {
    deleteError.value = null;
  }

  return {
    // State
    categories,
    loading,
    error,
    // Create category state
    creating,
    createError,
    // Update category state
    selectedCategory,
    updating,
    updateError,
    // Delete category state
    deleting,
    deleteError,
    // Actions
    fetchCategories,
    createCategory,
    clearCreateError,
    updateCategory,
    deleteCategory,
    selectCategory,
    clearUpdateError,
    clearDeleteError,
  };
});
