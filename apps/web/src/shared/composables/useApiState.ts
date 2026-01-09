import { ref } from 'vue';
import { ApiError } from '@shared/utils/api';

export function useApiState<T>() {
  const data = ref<T | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  async function execute(fn: () => Promise<T>) {
    isLoading.value = true;
    error.value = null;
    try {
      const result = await fn();
      data.value = result;
      return result;
    } catch (e) {
      error.value = e instanceof ApiError ? e.message : 'An error occurred';
      throw e;
    } finally {
      isLoading.value = false;
    }
  }

  return { data, isLoading, error, execute };
}
