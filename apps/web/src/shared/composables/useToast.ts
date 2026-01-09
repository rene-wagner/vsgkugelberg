import { ref } from 'vue';

export interface ToastMessage {
  id: number;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

export function useToast() {
  const toasts = ref<ToastMessage[]>([]);

  function show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
  ) {
    const id = Date.now();
    toasts.value.push({ id, message, type });
    setTimeout(() => remove(id), 5000);
  }

  function success(message: string) {
    show(message, 'success');
  }

  function error(message: string) {
    show(message, 'error');
  }

  function warning(message: string) {
    show(message, 'warning');
  }

  function info(message: string) {
    show(message, 'info');
  }

  function remove(id: number) {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  }

  return { toasts, success, error, warning, info, remove };
}
