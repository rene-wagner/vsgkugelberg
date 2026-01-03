<script setup lang="ts">
import { RouterLink } from 'vue-router';
import type { Trainer, TrainerLicense } from '../types/department-detail.types';

interface Props {
  trainer: Trainer;
  avatarGradient?: string;
  contactPagePath?: string;
}

const props = withDefaults(defineProps<Props>(), {
  avatarGradient: 'from-vsg-blue-400 to-vsg-blue-600',
  contactPagePath: '/kontakt',
});

function getLicenseBadgeClasses(variant: TrainerLicense['variant']): string {
  return variant === 'gold'
    ? 'bg-vsg-gold-100 text-vsg-gold-800'
    : 'bg-vsg-blue-100 text-vsg-blue-800';
}

function getContactLink(): string {
  if (props.trainer.contactPersonId) {
    return `${props.contactPagePath}?person=${props.trainer.contactPersonId}`;
  }
  return props.contactPagePath;
}
</script>

<template>
  <div
    class="card-hover group overflow-hidden rounded-xl border border-gray-200 bg-gray-50"
  >
    <!-- Avatar Area -->
    <div
      :class="[
        'aspect-square bg-linear-to-br relative overflow-hidden',
        avatarGradient,
      ]"
    >
      <!-- Avatar Image or Placeholder -->
      <img
        v-if="trainer.avatarUrl"
        :src="trainer.avatarUrl"
        :alt="trainer.name"
        class="h-full w-full object-cover"
      />
      <div
        v-else
        class="absolute inset-0 flex items-center justify-center"
      >
        <svg
          class="h-32 w-32 text-white/30"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
          />
        </svg>
      </div>

      <!-- Contact Overlay on Hover -->
      <div
        class="absolute inset-0 flex items-center justify-center bg-vsg-blue-900/60 opacity-0 transition-opacity group-hover:opacity-100"
      >
        <RouterLink
          :to="getContactLink()"
          class="translate-y-4 transform bg-vsg-gold-400 px-6 py-2 font-display text-lg tracking-wider text-vsg-blue-900 transition-transform group-hover:translate-y-0"
        >
          KONTAKT
        </RouterLink>
      </div>
    </div>

    <!-- Trainer Info -->
    <div class="p-6">
      <h3 class="font-display text-2xl tracking-wider text-vsg-blue-900">
        {{ trainer.name.toUpperCase() }}
      </h3>
      <p class="mb-3 font-body font-semibold text-vsg-blue-600">
        {{ trainer.role }}
      </p>

      <!-- Licenses -->
      <div class="mb-4 space-y-2">
        <div class="flex flex-wrap items-center gap-2">
          <span
            v-for="license in trainer.licenses"
            :key="license.name"
            :class="[
              getLicenseBadgeClasses(license.variant),
              'inline-block rounded px-2 py-1 font-body text-xs font-semibold',
            ]"
          >
            {{ license.name }}
          </span>
        </div>
        <p class="font-body text-sm text-gray-600">
          {{ trainer.experience }}
        </p>
      </div>

      <!-- Quote -->
      <p class="font-body text-sm leading-relaxed text-gray-600 italic">
        "{{ trainer.quote }}"
      </p>
    </div>
  </div>
</template>
