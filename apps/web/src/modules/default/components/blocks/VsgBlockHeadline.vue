<script setup lang="ts">
/**
 * VsgBlockHeadline - Dynamic heading component (h1-h6)
 *
 * Renders semantic heading elements based on configurable level prop.
 * Supports both `content` prop and slot for flexibility.
 *
 * Props:
 * - level: Heading level (1-6), default: 1
 * - content: Heading text content (required if no slot)
 * Events: None
 * Slots: Default (for custom content)
 */
import { computed, useSlots } from 'vue';

const props = defineProps({
  level: {
    type: Number,
    default: 1,
    validator: (value: number) => value >= 1 && value <= 6,
  },
  content: {
    type: String,
    required: false,
    default: '',
  },
});

const slots = useSlots();

const headingTag = computed(() => {
  const level = props.level ?? 1;
  return `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
});
</script>

<template>
  <component :is="headingTag" class="font-display tracking-tight">
    <slot v-if="slots.default" />
    <span v-else>{{ content }}</span>
  </component>
</template>
