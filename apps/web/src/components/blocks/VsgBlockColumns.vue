<script lang="ts" setup>
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    columnCount?: number;
  }>(),
  {
    columnCount: 1,
  }
);

const gridColumnsClass = computed(() => {
  const columnClasses: Record<number, string> = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-4',
    5: 'md:grid-cols-5',
    6: 'md:grid-cols-6',
    7: 'md:grid-cols-7',
    8: 'md:grid-cols-8',
    9: 'md:grid-cols-9',
    10: 'md:grid-cols-10',
    11: 'md:grid-cols-11',
    12: 'md:grid-cols-12',
  };
  return columnClasses[props.columnCount] || 'md:grid-cols-1';
});
</script>

<template>
  <div class="grid grid-cols-1" :class="gridColumnsClass"></div>
</template>
