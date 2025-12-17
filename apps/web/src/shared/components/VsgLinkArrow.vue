<script setup lang="ts">
interface Props {
  href?: string;
}

withDefaults(defineProps<Props>(), {
  href: '#',
});
</script>

<template>
  <a
    :href="href"
    class="inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-wider text-vsg-blue-600 transition-colors hover:text-vsg-blue-800"
  >
    <slot />
    <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M17 8l4 4m0 0l-4 4m4-4H3"
      />
    </svg>
  </a>
</template>
