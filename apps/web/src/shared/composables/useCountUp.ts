import { ref, watch } from 'vue';
import type { Ref } from 'vue';

interface UseCountUpOptions {
  duration?: number;
}

/**
 * Returns a `displayValue` ref that animates from 0 → target.value
 * whenever `enabled` flips to true.
 *
 * NOTE: This composable does NOT register onUnmounted internally.
 * The caller is responsible for cancelling animation via the returned
 * `cancel` function (typically inside their own onUnmounted hook).
 */
export function useCountUp(
  target: Ref<number>,
  enabled: Ref<boolean>,
  options: UseCountUpOptions = {},
): { displayValue: Ref<number>; cancel: () => void } {
  const { duration = 1500 } = options;

  const displayValue = ref(0);
  let rafHandle: number | null = null;

  function cancel() {
    if (rafHandle !== null) {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
    }
  }

  function runAnimation() {
    const targetValue = target.value;

    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      displayValue.value = targetValue;
      return;
    }

    const startTime = performance.now();

    function tick(now: number) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out: t * (2 - t)
      const eased = progress * (2 - progress);

      displayValue.value = Math.round(eased * targetValue);

      if (progress < 1) {
        rafHandle = requestAnimationFrame(tick);
      } else {
        displayValue.value = targetValue;
        rafHandle = null;
      }
    }

    cancel();
    rafHandle = requestAnimationFrame(tick);
  }

  watch(enabled, (isEnabled) => {
    if (isEnabled) {
      runAnimation();
    }
  });

  return { displayValue, cancel };
}
