<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { DepartmentLocation } from '../types/department-detail.types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface Props {
  location: DepartmentLocation;
}

defineProps<Props>();

function getBadgeClasses(variant: DepartmentLocation['badgeVariant']): string {
  return variant === 'primary' ? 'bg-vsg-gold-400 text-vsg-blue-900' : 'bg-white text-vsg-blue-900';
}

function getMediaUrl(filename: string): string {
  return `${API_BASE_URL}/uploads/${filename}`;
}
</script>

<template>
  <div class="card-hover overflow-hidden rounded-xl border border-gray-200 bg-white">
    <!-- Location Image -->
    <div
      v-if="location.image"
      class="aspect-video relative"
    >
      <img
        :src="getMediaUrl(location.image.filename)"
        :alt="location.image.originalName"
        class="w-full h-full object-cover"
      />
      <!-- Badge -->
      <div class="absolute left-4 top-4">
        <span :class="[getBadgeClasses(location.badgeVariant), 'inline-block rounded px-3 py-1 font-display text-sm tracking-wider shadow-sm']">
          {{ location.badge }}
        </span>
      </div>
    </div>

    <!-- Fallback if no image (just show badge) -->
    <div
      v-else
      class="p-4 bg-gray-50 border-b border-gray-100"
    >
      <span
        :class="[getBadgeClasses(location.badgeVariant), 'inline-block rounded px-3 py-1 font-display text-sm tracking-wider border border-gray-200']"
      >
        {{ location.badge }}
      </span>
    </div>

    <!-- Location Details -->
    <div class="p-8">
      <h3 class="mb-2 font-display text-2xl tracking-wider text-vsg-blue-900">
        {{ location.name.toUpperCase() }}
      </h3>

      <div class="mb-6 space-y-3">
        <!-- Address -->
        <div class="flex items-start gap-3">
          <FontAwesomeIcon
            icon="location-dot"
            class="mt-0.5 text-vsg-blue-600"
          />
          <div>
            <p class="font-body font-semibold text-vsg-blue-800">
              {{ location.street }}
            </p>
            <p class="font-body text-gray-600">{{ location.city }}</p>
          </div>
        </div>

        <!-- Amenities -->
        <div
          v-if="location.amenities.length > 0"
          class="flex items-start gap-3"
        >
          <!-- Info Icon -->
          <FontAwesomeIcon
            icon="info-circle"
            class="mt-0.5 text-vsg-blue-600"
          />
          <p class="font-body text-gray-600">
            {{ location.amenities.map((a) => a.text).join(', ') }}
          </p>
        </div>
      </div>

      <!-- Route Link -->
      <a
        v-if="location.mapsUrl"
        :href="location.mapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 font-body text-sm font-bold uppercase tracking-wider text-vsg-blue-600 transition-colors hover:text-vsg-blue-800"
      >
        Route planen
        <FontAwesomeIcon icon="arrow-up-right-from-square" />
      </a>
    </div>
  </div>
</template>
