<script lang="ts" setup>
defineOptions({ inheritAttrs: false });

withDefaults(defineProps<{ size?: string }>(), { size: 'w-5 h-5' });
</script>

<template>
  <svg
    :class="[size, $attrs.class]"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M4 6h16M4 10h16M4 14h16M4 18h10"
    />
  </svg>
</template>
