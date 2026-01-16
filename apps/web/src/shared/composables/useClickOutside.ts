import { onMounted, onUnmounted, type Ref } from 'vue';

export function useClickOutside(target: Ref<HTMLElement | null>, callback: () => void) {
  function handleClickOutside(event: MouseEvent) {
    const element = target.value;
    if (element && !element.contains(event.target as Node)) {
      callback();
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside);
  });

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside);
  });
}
