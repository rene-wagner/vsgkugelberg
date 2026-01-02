<script setup lang="ts">
/**
 * VsgBlockSection - Section component with optional hero mode
 *
 * Renders semantic section element with optional full-viewport
 * dimensions and centered content for hero layouts.
 *
 * Props:
 * - isHero: Enable hero mode, default: false
 * Events: None
 * Slots: Default
 */
const props = defineProps<{
  isHero?: boolean;
}>();
</script>

<template>
  <section
    :class="{
      'w-screen h-screen flex items-center justify-center': props.isHero,
    }"
  >
    <slot />
  </section>
</template>
