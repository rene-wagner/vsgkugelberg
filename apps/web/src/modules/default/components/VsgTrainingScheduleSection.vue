<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
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
                <FontAwesomeIcon
                  v-if="group.icon === 'youth'"
                  icon="child"
                  :class="[getIconClasses(group.variant)]"
                />
                <!-- Adults Icon -->
                <FontAwesomeIcon
                  v-else-if="group.icon === 'adults'"
                  icon="person"
                  :class="[getIconClasses(group.variant)]"
                />
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
              <!-- eslint-disable-next-line vue/no-v-html -->
              <p class="font-body text-sm" v-html="group.note" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
