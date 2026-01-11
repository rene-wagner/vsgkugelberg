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
    <FontAwesomeIcon icon="arrow-right" />
  </a>
</template>
