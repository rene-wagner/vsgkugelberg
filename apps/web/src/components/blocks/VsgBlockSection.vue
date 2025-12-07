<script lang="ts" setup>
withDefaults(
  defineProps<{
    isHero?: boolean;
  }>(),
  {
    isHero: false,
  }
);
</script>

<template>
  <section
    :class="{
      'w-screen h-screen flex items-center justify-center': isHero,
    }"
  ></section>
</template>
