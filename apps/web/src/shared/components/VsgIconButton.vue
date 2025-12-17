<script setup lang="ts">
interface Props {
  href?: string;
  ariaLabel?: string;
}

withDefaults(defineProps<Props>(), {
  href: '#',
  ariaLabel: '',
});
</script>

<template>
  <a
    :href="href"
    :aria-label="ariaLabel"
    class="flex h-10 w-10 items-center justify-center rounded-lg bg-vsg-blue-800 text-vsg-gold-400 transition-colors hover:bg-vsg-gold-400 hover:text-vsg-blue-900"
  >
    <slot />
  </a>
</template>
