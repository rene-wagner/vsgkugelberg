import { ref, computed } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

interface FormHandlerOptions {
  successMessage?: string;
  onSuccess?: () => void | Promise<void>;
  redirectPath?: RouteLocationRaw;
  onError?: (error: Error) => void;
}

export function useFormHandler<T extends Record<string, unknown>>(initialData: T, options: FormHandlerOptions = {}) {
  const formData = ref<T>({ ...initialData });
  const error = ref('');
  const isSubmitting = ref(false);

  const canSubmit = computed(() => {
    return Object.values(formData.value).every((value) => value !== '' && value !== null && value !== undefined);
  });

  function updateField<K extends keyof T>(key: K, value: T[K]) {
    formData.value[key] = value;
  }

  function reset() {
    formData.value = { ...initialData };
    error.value = '';
  }

  async function handleSubmit(submitFn: (data: T) => Promise<void>) {
    if (!canSubmit.value) return;

    error.value = '';
    isSubmitting.value = true;

    try {
      await submitFn(formData.value);
      await options.onSuccess?.();

      if (options.redirectPath) {
        const { useRouter } = await import('vue-router');
        const router = useRouter();
        router.push(options.redirectPath);
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten';
      options.onError?.(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      isSubmitting.value = false;
    }
  }

  return {
    formData,
    error,
    isSubmitting,
    canSubmit,
    updateField,
    reset,
    handleSubmit,
  };
}
