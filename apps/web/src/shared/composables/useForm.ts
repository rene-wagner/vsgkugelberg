import { ref, computed } from 'vue';
import type { ValidationRule } from '@shared/utils/validation';

interface FormField<T = unknown> {
  value: T;
  error: string | null;
  touched: boolean;
}

interface UseFormOptions<T> {
  initialValues: T;
  validationRules?: Partial<Record<keyof T, ValidationRule[]>>;
  onSubmit?: (values: T) => void | Promise<void>;
}

export function useForm<T extends Record<string, unknown>>(options: UseFormOptions<T>) {
  const fields = ref<Partial<Record<keyof T, FormField>>>({});
  const isSubmitting = ref(false);

  const isValid = computed(() => {
    return Object.values(fields.value).every((field) => !field || (field as FormField).error === null);
  });

  function initializeFields() {
    const initial: Partial<Record<keyof T, FormField>> = {};
    for (const key in options.initialValues) {
      initial[key as keyof T] = {
        value: options.initialValues[key],
        error: null,
        touched: false,
      };
    }
    fields.value = initial;
  }

  function validateField(fieldName: keyof T): void {
    const field = fields.value[fieldName];
    if (!field) return;

    const rules = options.validationRules?.[fieldName] || [];
    const errors: string[] = [];
    for (const rule of rules) {
      const error = rule.validate(String(field.value));
      if (error) {
        errors.push(error);
      }
    }
    field.error = errors.length > 0 ? errors[0] : null;
  }

  async function validateAll(): Promise<boolean> {
    let valid = true;
    for (const fieldName in fields.value) {
      validateField(fieldName);
      if (fields.value[fieldName]?.error) {
        valid = false;
      }
      if (fields.value[fieldName]) {
        fields.value[fieldName]!.touched = true;
      }
    }
    return valid;
  }

  function handleInput<K extends keyof T>(fieldName: K, value: T[K]): void {
    const field = fields.value[fieldName];
    if (!field) return;

    field.value = value as unknown;
    field.error = null;

    if (field.touched) {
      validateField(fieldName);
    }
  }

  function handleBlur(fieldName: keyof T): void {
    const field = fields.value[fieldName];
    if (!field) return;

    field.touched = true;
    validateField(fieldName);
  }

  function getValues(): T {
    const values = {} as T;
    const keys = Object.keys(fields.value) as Array<keyof T>;
    for (const key of keys) {
      const field = fields.value[key];
      if (field) {
        values[key] = field.value as T[keyof T];
      }
    }
    return values;
  }

  function reset(): void {
    initializeFields();
    isSubmitting.value = false;
  }

  async function submit(): Promise<void> {
    if (!(await validateAll())) {
      return;
    }

    isSubmitting.value = true;
    try {
      await options.onSubmit?.(getValues());
    } finally {
      isSubmitting.value = false;
    }
  }

  initializeFields();

  return {
    fields,
    isSubmitting,
    isValid,
    validateField,
    validateAll,
    handleInput,
    handleBlur,
    getValues,
    reset,
    submit,
  };
}
