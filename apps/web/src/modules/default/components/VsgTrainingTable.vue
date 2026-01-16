<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
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
        <th class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900">TAG</th>
        <th class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900">ZEIT</th>
        <th class="pb-4 text-left font-display text-lg tracking-wider text-vsg-blue-900">STANDORT</th>
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100 block md:table-row-group">
      <tr
        v-for="session in sessions"
        :key="`${session.day}-${session.time}`"
        class="group block md:table-row py-4 md:py-0 transition-colors hover:bg-vsg-blue-50"
      >
        <td class="block md:table-cell md:py-4 font-body font-semibold text-vsg-blue-800">
          {{ session.day }}
        </td>
        <td class="block md:table-cell md:py-4 font-body text-gray-600">
          <div class="flex items-center gap-1.5">
            <FontAwesomeIcon
              icon="clock"
              class="text-vsg-blue-400 md:hidden! shrink-0"
            />
            <span>{{ session.time }}</span>
          </div>
        </td>
        <td class="block md:table-cell md:py-4 font-body text-gray-500 md:text-gray-600 mt-1 md:mt-0">
          <div class="flex items-center gap-1.5">
            <FontAwesomeIcon
              icon="location-dot"
              class="text-vsg-blue-400 md:hidden! shrink-0"
            />
            <span class="text-sm md:text-base">
              {{ session.locationName || '-' }}
            </span>
          </div>
        </td>
      </tr>
    </tbody>
  </table>
</template>
