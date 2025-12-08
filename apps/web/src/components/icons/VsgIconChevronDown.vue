<template>
  <svg
    :class="[size, $attrs.class]"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <path d="M19 9l-7 7-7-7" />
  </svg>
</template>

<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
});

withDefaults(
  defineProps<{
    size?: string;
  }>(),
  {
    size: 'w-5 h-5',
  }
);
</script>
