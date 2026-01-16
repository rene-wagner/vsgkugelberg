import { ref, type Ref } from 'vue';

export function useModal<T = unknown>() {
  const isOpen = ref(false);
  const data = ref<T | null>(null) as Ref<T | null>;

  function open(value?: T) {
    data.value = value ?? null;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    data.value = null;
  }

  function toggle() {
    if (isOpen.value) {
      close();
    } else {
      open();
    }
  }

  return {
    isOpen,
    data,
    open,
    close,
    toggle,
  };
}
