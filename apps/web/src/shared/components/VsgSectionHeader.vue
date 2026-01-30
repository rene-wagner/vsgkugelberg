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
    <span class="font-body font-normal uppercase tracking-widest text-vsg-blue-600">
      {{ subtitle }}
    </span>
    <h3 class="mt-4 font-display text-6xl text-vsg-blue-900 md:text-7xl">
      {{ title }}
    </h3>
  </div>
</template>
