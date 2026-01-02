<script setup lang="ts">
/**
 * VsgBlockImage - Image component with accessibility and lazy loading
 *
 * Renders images with native lazy loading, accessibility support,
 * and fallback UI for load errors.
 *
 * Props:
 * - src: Image URL (required)
 * - alt: Alternative text
 * - title: Tooltip text
 * - ariaDescribedby: ARIA describedby attribute value
 * Events: None
 * Slots: None
 */
import { ref } from 'vue';

defineProps<{
  src: string;
  alt?: string;
  title?: string;
  ariaDescribedby?: string;
}>();

const imageError = ref(false);

function handleImageError() {
  imageError.value = true;
}
</script>

<template>
  <div class="relative">
    <!-- Fallback UI when image fails to load -->
    <div
      v-if="imageError"
      class="flex min-h-[200px] items-center justify-center rounded-lg bg-vsg-blue-800 p-4 text-vsg-gold-300"
    >
      <p class="text-center">
        {{ alt || 'Image not available' }}
      </p>
    </div>

    <!-- Image element with lazy loading and accessibility attributes -->
    <img
      v-else
      :src="src"
      :alt="alt || ''"
      :title="title"
      :aria-describedby="ariaDescribedby"
      loading="lazy"
      class="rounded-lg"
      @error="handleImageError"
    />
  </div>
</template>
