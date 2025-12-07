<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    level?: 1 | 2 | 3 | 4 | 5 | 6;
    content: string;
  }>(),
  {
    level: 1,
  }
);

const tag = computed(() => `h${props.level}`);
</script>

<template>
  <component :is="tag">{{ content }}</component>
</template>
