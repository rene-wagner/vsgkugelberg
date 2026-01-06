<script setup lang="ts">
import type { TrainingSession } from '../types/department-detail.types';

interface Props {
  sessions: TrainingSession[];
}

defineProps<Props>();
</script>

<template>
  <table class="w-full block md:table">
    <thead class="hidden md:table-header-group">
      <tr class="border-b-2 border-gray-200">
        <th
          class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900"
        >
          TAG
        </th>
        <th
          class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900"
        >
          ZEIT
        </th>
        <th
          class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900"
        >
          STANDORT
        </th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 block md:table-row-group">
      <tr
        v-for="session in sessions"
        :key="`${session.day}-${session.time}`"
        class="group block md:table-row py-4 md:py-0 transition-colors hover:bg-vsg-blue-50"
      >
        <td
          class="block md:table-cell md:py-4 font-body font-semibold text-vsg-blue-800"
        >
          {{ session.day }}
        </td>
        <td class="block md:table-cell md:py-4 font-body text-gray-600">
          <div class="flex items-center gap-1.5">
            <!-- Mobile Clock Icon -->
            <svg
              class="w-3.5 h-3.5 text-vsg-blue-400 md:hidden flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>{{ session.time }}</span>
          </div>
        </td>
        <td
          class="block md:table-cell md:py-4 font-body text-gray-500 md:text-gray-600 mt-1 md:mt-0"
        >
          <div class="flex items-center gap-1.5">
            <!-- Mobile Map Pin Icon -->
            <svg
              class="w-3.5 h-3.5 text-vsg-blue-400 md:hidden flex-shrink-0"
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
            <span class="text-sm md:text-base">
              {{ session.locationName || '-' }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
