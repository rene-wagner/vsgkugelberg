<script setup lang="ts">
import type { HomepageStat } from '@/shared/types/homepage-content.types';

interface Props {
  stats?: HomepageStat[];
}

const props = defineProps<Props>();

const displayStats = props.stats || [];
</script>

<template>
  <section class="relative bg-gray-50 py-20">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-4">
        <div
          v-for="(stat, index) in displayStats"
          :key="stat.label"
          class="animate-scale-in text-center"
          :class="`delay-${(index + 1) * 100}`"
        >
          <span class="font-display text-6xl text-vsg-blue-600 md:text-8xl">
            {{ stat.value }}
          </span>
          <span class="mt-2 block font-body text-sm font-normal uppercase tracking-widest text-vsg-blue-800">
            {{ stat.label }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
