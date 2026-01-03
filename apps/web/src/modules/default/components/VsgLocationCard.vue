<script setup lang="ts">
import type { DepartmentLocation } from '../types/department-detail.types';

interface Props {
  location: DepartmentLocation;
}

defineProps<Props>();

function getBadgeClasses(variant: DepartmentLocation['badgeVariant']): string {
  return variant === 'primary'
    ? 'bg-vsg-gold-400 text-vsg-blue-900'
    : 'bg-white text-vsg-blue-900';
}

function getMapGradient(variant: DepartmentLocation['badgeVariant']): string {
  return variant === 'primary'
    ? 'from-vsg-blue-600 to-vsg-blue-800'
    : 'from-vsg-blue-500 to-vsg-blue-700';
}
</script>

<template>
  <div
    class="card-hover overflow-hidden rounded-xl border border-gray-200 bg-white"
  >
    <!-- Map Placeholder -->
    <div
      :class="[
        'aspect-video bg-linear-to-br relative',
        getMapGradient(location.badgeVariant),
      ]"
    >
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="text-center">
          <svg
            class="mx-auto mb-2 h-16 w-16 text-white/50"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span class="font-body text-sm text-white/70">Kartenansicht</span>
        </div>
      </div>
      <!-- Badge -->
      <div class="absolute left-4 top-4">
        <span
          :class="[
            getBadgeClasses(location.badgeVariant),
            'inline-block rounded px-3 py-1 font-display text-sm tracking-wider',
          ]"
        >
          {{ location.badge }}
        </span>
      </div>
    </div>

    <!-- Location Details -->
    <div class="p-8">
      <h3
        class="mb-2 font-display text-2xl tracking-wider text-vsg-blue-900"
      >
        {{ location.name.toUpperCase() }}
      </h3>

      <div class="mb-6 space-y-3">
        <!-- Address -->
        <div class="flex items-start gap-3">
          <svg
            class="mt-0.5 h-5 w-5 shrink-0 text-vsg-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <div>
            <p class="font-body font-semibold text-vsg-blue-800">
              {{ location.street }}
            </p>
            <p class="font-body text-gray-600">{{ location.city }}</p>
          </div>
        </div>

        <!-- Amenities -->
        <div
          v-for="amenity in location.amenities"
          :key="amenity.text"
          class="flex items-center gap-3"
        >
          <!-- Tables Icon -->
          <svg
            v-if="amenity.icon === 'tables'"
            class="h-5 w-5 shrink-0 text-vsg-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
            />
          </svg>
          <!-- Check Icon -->
          <svg
            v-else-if="
              amenity.icon === 'check' ||
              amenity.icon === 'changing-rooms' ||
              amenity.icon === 'parking'
            "
            class="h-5 w-5 shrink-0 text-vsg-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <!-- Info Icon -->
          <svg
            v-else-if="amenity.icon === 'info'"
            class="h-5 w-5 shrink-0 text-vsg-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p class="font-body text-gray-600">{{ amenity.text }}</p>
        </div>
      </div>

      <!-- Route Link -->
      <a
        :href="location.mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-wider text-vsg-blue-600 transition-colors hover:text-vsg-blue-800"
      >
        Route planen
        <svg
          class="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </a>
    </div>
  </div>
</template>
