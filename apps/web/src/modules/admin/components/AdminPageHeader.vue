<script setup lang="ts">
import { computed, useSlots } from 'vue';

interface Props {
  /**
   * The main heading text (h1)
   */
  title: string;
  /**
   * The subtitle/description text (p element)
   */
  description?: string;
}

defineProps<Props>();

const slots = useSlots();

const headerClasses = computed(() => {
  const classes = ['mb-8'];

  if (slots.actions) {
    classes.push('flex', 'items-start', 'justify-between');
  }

  return classes.join(' ');
});
</script>

<template>
  <div :class="headerClasses">
    <div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">{{ title }}</h1>
      <p
        v-if="description"
        class="font-body font-normal text-vsg-blue-600 mt-1"
      >
        {{ description }}
      </p>
    </div>
    <div
      v-if="$slots.actions"
      class="flex gap-3"
    >
      <slot name="actions" />
    </div>
  </div>
</template>
