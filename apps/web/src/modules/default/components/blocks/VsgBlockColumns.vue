<script setup lang="ts">
/**
 * VsgBlockColumns - CSS Grid container for multi-column layouts
 *
 * Renders a flexible grid container with configurable column count.
 * Uses Tailwind breakpoint system for responsive behavior.
 *
 * Props:
 * - columnCount: Number of columns, default: 1
 * Events: None
 * Slots: Default (for VsgBlockColumn children)
 */
const props = defineProps({
  columnCount: {
    type: Number,
    default: 1,
  },
});
</script>

<template>
  <div
    class="grid gap-6"
    :class="{
      'grid-cols-1': !props.columnCount || props.columnCount === 1,
      'grid-cols-2 md:grid-cols-2': props.columnCount === 2,
      'grid-cols-3 md:grid-cols-3': props.columnCount === 3,
      'grid-cols-4 md:grid-cols-4': props.columnCount === 4,
    }"
  >
    <slot />
  </div>
</template>
