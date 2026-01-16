import { ref } from 'vue';

interface KeyboardNavOptions {
  onEscape?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onTab?: (e: KeyboardEvent) => void;
}

export function useKeyboardNav(options: KeyboardNavOptions) {
  const currentIndex = ref(0);

  function handleKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        options.onEscape?.();
        break;
      case 'ArrowUp':
        event.preventDefault();
        options.onArrowUp?.();
        currentIndex.value = Math.max(0, currentIndex.value - 1);
        break;
      case 'ArrowDown':
        event.preventDefault();
        options.onArrowDown?.();
        currentIndex.value = currentIndex.value + 1;
        break;
      case 'Enter':
        event.preventDefault();
        options.onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        options.onSpace?.();
        break;
      case 'Home':
        event.preventDefault();
        options.onHome?.();
        currentIndex.value = 0;
        break;
      case 'End':
        event.preventDefault();
        options.onEnd?.();
        break;
      case 'Tab':
        options.onTab?.(event);
        break;
    }
  }

  function attachToElement(element: HTMLElement) {
    element.addEventListener('keydown', handleKeyDown);
  }

  function detachFromElement(element: HTMLElement) {
    element.removeEventListener('keydown', handleKeyDown);
  }

  return {
    currentIndex,
    handleKeyDown,
    attachToElement,
    detachFromElement,
  };
}
