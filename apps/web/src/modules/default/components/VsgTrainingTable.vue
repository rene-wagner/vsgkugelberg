<script setup lang="ts">
import type { TrainingSession } from '../types/department-detail.types';

interface Props {
  sessions: TrainingSession[];
}

defineProps<Props>();
</script>

<template>
  <table class="w-full">
    <thead>
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
      </tr>
    </thead>
    <tbody class="divide-y divide-gray-100">
      <tr
        v-for="session in sessions"
        :key="`${session.day}-${session.time}`"
        class="group transition-colors hover:bg-vsg-blue-50"
      >
        <td class="py-4 font-body font-semibold text-vsg-blue-800">
          {{ session.day }}
        </td>
        <td class="py-4 font-body text-gray-600">
          {{ session.time }}
        </td>
      </tr>
    </tbody>
  </table>
</template>
