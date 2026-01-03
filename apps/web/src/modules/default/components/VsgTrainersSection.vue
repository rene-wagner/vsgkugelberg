<script setup lang="ts">
import type { Trainer } from '../types/department-detail.types';
import VsgTrainerCard from './VsgTrainerCard.vue';

interface Props {
  title: string;
  subtitle: string;
  description?: string;
  trainers: Trainer[];
  contactPagePath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  contactPagePath: '/kontakt',
});

// Vary the gradient slightly for visual interest
function getAvatarGradient(index: number): string {
  const gradients = [
    'from-vsg-blue-400 to-vsg-blue-600',
    'from-vsg-blue-500 to-vsg-blue-700',
    'from-vsg-blue-600 to-vsg-blue-800',
  ];
  return gradients[index % gradients.length];
}
</script>

<template>
  <section class="relative bg-white py-32">
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

      <!-- Trainers Grid -->
      <div class="grid gap-8 md:grid-cols-3">
        <VsgTrainerCard
          v-for="(trainer, index) in trainers"
          :key="trainer.name"
          :trainer="trainer"
          :avatar-gradient="getAvatarGradient(index)"
          :contact-page-path="props.contactPagePath"
        />
      </div>
    </div>
  </section>
</template>
