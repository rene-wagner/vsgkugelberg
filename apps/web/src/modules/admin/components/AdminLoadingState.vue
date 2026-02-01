<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  /**
   * Optional loading message (displayed below spinner)
   * If not provided, no message is shown (just spinner)
   */
  message?: string;

  /**
   * Additional hint/description text
   * Shows below the main message in smaller gray text
   */
  hint?: string;

  /**
   * Vertical padding class (default: 'py-12')
   * Can be customized per use case (e.g., 'py-8', 'py-0')
   */
  padding?: string;
}

const props = withDefaults(defineProps<Props>(), {
  padding: 'py-12',
});

const paddingClass = computed(() => props.padding);
</script>

<template>
  <div
    class="text-center"
    :class="paddingClass"
  >
    <slot>
      <!-- Animated spinner -->
      <div class="w-12 h-12 border-4 border-vsg-blue-200 border-t-vsg-blue-600 rounded-full animate-spin mx-auto mb-4"></div>

      <!-- Optional message -->
      <p
        v-if="message"
        class="font-body text-gray-600"
      >
        {{ message }}
      </p>

      <!-- Optional hint -->
      <p
        v-if="hint"
        class="font-body text-sm text-gray-500 mt-2"
      >
        {{ hint }}
      </p>
    </slot>
  </div>
</template>
