<script setup lang="ts">
/**
 * VsgBlockParagraph - Paragraph text wrapper
 *
 * Renders paragraph content with consistent styling.
 * Supports both `content` prop and slot for flexibility.
 *
 * Props:
 * - content: Paragraph text content (optional if slot provided)
 * Events: None
 * Slots: Default (for custom content)
 */
import { useSlots } from 'vue';

defineProps<{
  content?: string;
}>();

const slots = useSlots();
</script>

<template>
  <p class="font-body text-base leading-relaxed">
    <slot v-if="slots.default" />
    <span v-else>{{ content }}</span>
  </p>
</template>
