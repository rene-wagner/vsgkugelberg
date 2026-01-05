<script setup lang="ts">
import type { TrainingGroup } from '../types/department-detail.types';
import VsgTrainingTable from './VsgTrainingTable.vue';

interface Props {
  title: string;
  subtitle: string;
  description?: string;
  groups: TrainingGroup[];
}

defineProps<Props>();

function getHeaderClasses(variant: TrainingGroup['variant']): string {
  return variant === 'primary' ? 'bg-vsg-blue-600' : 'bg-vsg-blue-900';
}

function getIconBgClasses(variant: TrainingGroup['variant']): string {
  return variant === 'primary' ? 'bg-white/20' : 'bg-vsg-gold-400/20';
}

function getIconClasses(variant: TrainingGroup['variant']): string {
  return variant === 'primary' ? 'text-white' : 'text-vsg-gold-400';
}

function getAgeRangeClasses(variant: TrainingGroup['variant']): string {
  return variant === 'primary' ? 'text-vsg-blue-100' : 'text-vsg-blue-300';
}

function getNoteClasses(variant: TrainingGroup['variant']): string {
  return variant === 'primary'
    ? 'bg-vsg-gold-50 border-vsg-gold-200 text-vsg-gold-800'
    : 'bg-vsg-blue-50 border-vsg-blue-200 text-vsg-blue-800';
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

      <!-- Training Groups Grid -->
      <div
        :class="[
          'gap-12',
          groups.length === 1 ? 'flex justify-center' : 'grid lg:grid-cols-2',
        ]"
      >
        <div
          v-for="group in groups"
          :key="group.name"
          :class="[
            'card-hover overflow-hidden rounded-xl border border-gray-200 bg-gray-50',
            { 'w-full max-w-2xl': groups.length === 1 },
          ]"
        >
          <!-- Card Header -->
          <div :class="[getHeaderClasses(group.variant), 'px-8 py-6']">
            <div class="flex items-center gap-4">
              <div
                :class="[
                  getIconBgClasses(group.variant),
                  'flex h-14 w-14 items-center justify-center rounded-lg',
                ]"
              >
                <!-- Youth Icon -->
                <svg
                  v-if="group.icon === 'youth'"
                  :class="[getIconClasses(group.variant), 'h-8 w-8']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <!-- Adults Icon -->
                <svg
                  v-else-if="group.icon === 'adults'"
                  :class="[getIconClasses(group.variant), 'h-8 w-8']"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-display text-3xl tracking-wider text-white">
                  {{ group.name.toUpperCase() }}
                </h3>
                <span
                  :class="[
                    getAgeRangeClasses(group.variant),
                    'font-body font-normal',
                  ]"
                >
                  {{ group.ageRange }}
                </span>
              </div>
            </div>
          </div>

          <!-- Schedule Table -->
          <div class="p-8">
            <VsgTrainingTable :sessions="group.sessions" />

            <!-- Optional Note -->
            <div
              v-if="group.note"
              :class="[
                getNoteClasses(group.variant),
                'mt-6 rounded-lg border p-4',
              ]"
            >
              <p class="font-body text-sm" v-html="group.note" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
