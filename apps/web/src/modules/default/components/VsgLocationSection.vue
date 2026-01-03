<script setup lang="ts">
import type { DepartmentLocation } from '../types/department-detail.types';
import VsgLocationCard from './VsgLocationCard.vue';

interface Props {
  title: string;
  subtitle: string;
  description?: string;
  locations: DepartmentLocation[];
}

defineProps<Props>();
</script>

<template>
  <section class="relative bg-gray-50 py-32">
    <div class="mx-auto max-w-7xl px-6">
      <!-- Section Header -->
      <div class="mb-16 text-center">
        <span
          class="font-body text-sm font-normal uppercase tracking-[0.4em] text-vsg-blue-600"
        >
          {{ subtitle }}
        </span>
        <h2
          class="mt-4 font-display text-5xl tracking-wider text-vsg-blue-900 md:text-7xl"
        >
          {{ title }}
        </h2>
        <p
          v-if="description"
          class="mx-auto mt-4 max-w-2xl font-body text-lg font-normal text-gray-600"
        >
          {{ description }}
        </p>
      </div>

      <!-- Locations Grid -->
      <div class="grid gap-8 md:grid-cols-2">
        <VsgLocationCard
          v-for="location in locations"
          :key="location.name"
          :location="location"
        />
      </div>
    </div>
  </section>
</template>
