import { ref, onUnmounted } from 'vue';

export function useSuccessMessage(initialDelay = 5000) {
  const message = ref<string | null>(null);
  let timeout: ReturnType<typeof setTimeout>;

  function show(msg: string, delay = initialDelay) {
    message.value = msg;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      message.value = null;
    }, delay);
  }

  function clear() {
    clearTimeout(timeout);
    message.value = null;
  }

  onUnmounted(() => {
    clearTimeout(timeout);
  });

  return { message, show, clear };
}
