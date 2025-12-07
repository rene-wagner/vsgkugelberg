<script lang="ts" setup>
import { ref } from 'vue';

defineProps<{
  src: string;
  alt?: string;
  title?: string;
  ariaDescribedby?: string;
}>();

const hasError = ref(false);

const handleError = () => {
  hasError.value = true;
};
</script>

<template>
  <div
    v-if="hasError"
    class="bg-gray-100 border border-gray-300 rounded p-4 flex items-center justify-center min-h-32 text-gray-500"
  >
    {{ alt || 'Image failed to load' }}
  </div>
  <img
    v-else
    :src="src"
    :alt="alt ?? ''"
    :title="title"
    :aria-describedby="ariaDescribedby"
    loading="lazy"
    class="max-w-full h-auto"
    @error="handleError"
  />
</template>
