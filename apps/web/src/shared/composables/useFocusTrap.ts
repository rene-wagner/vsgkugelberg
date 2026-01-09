import { onMounted, onUnmounted, type MaybeRefOrGetter, toValue } from 'vue';

export function useFocusTrap(
  elementRef: MaybeRefOrGetter<HTMLElement | undefined>,
) {
  let previouslyFocused: HTMLElement | null = null;

  onMounted(() => {
    const element = toValue(elementRef);
    if (!element) return;

    previouslyFocused = document.activeElement as HTMLElement;
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstFocusable = focusableElements[0] as HTMLElement | null;

    firstFocusable?.focus();
  });

  onUnmounted(() => {
    previouslyFocused?.focus();
  });
}
