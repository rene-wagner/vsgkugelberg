<script setup lang="ts">
interface Props {
  subtitle: string;
  title: string;
  centered?: boolean;
}

withDefaults(defineProps<Props>(), {
  centered: true,
});
</script>

<template>
  <div :class="{ 'text-center': centered }">
    <span class="font-body text-sm font-normal uppercase tracking-[0.4em] text-vsg-blue-600">
      {{ subtitle }}
    </span>
    <h3 class="mt-4 font-display text-6xl tracking-wider text-vsg-blue-900 md:text-8xl">
      {{ title }}
    </h3>
  </div>
</template>
