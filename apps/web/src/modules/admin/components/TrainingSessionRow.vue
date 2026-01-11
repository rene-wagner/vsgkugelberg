<script setup lang="ts">
import { ref, watch } from 'vue';
import type { DepartmentTrainingSession, DepartmentLocation } from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  session: DepartmentTrainingSession;
  locations: DepartmentLocation[];
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', data: { day: string; time: string; locationId: number | null }): void;
  (e: 'delete'): void;
}>();

const day = ref(props.session.day);
const time = ref(props.session.time);
const locationId = ref(props.session.locationId);

const dayOptions = ['Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag', 'Sonntag'];

// Watch for external session changes
watch(
  () => props.session,
  (newSession) => {
    day.value = newSession.day;
    time.value = newSession.time;
    locationId.value = newSession.locationId;
  },
);

// Emit updates when values change
watch([day, time, locationId], () => {
  emit('update', {
    day: day.value,
    time: time.value,
    locationId: locationId.value,
  });
});

function handleDelete() {
  emit('delete');
}
</script>

<template>
  <div class="flex items-center gap-2 p-2 bg-white rounded border border-gray-200 group" :class="{ 'border-vsg-lime-400 bg-vsg-lime-50': isNew }">
    <!-- Drag Handle -->
    <div class="cursor-grab text-gray-400 hover:text-gray-600 session-drag-handle shrink-0">
      <FontAwesomeIcon icon="grip" />
    </div>

    <!-- Day Select -->
    <select
      v-model="day"
      class="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
    >
      <option value="" disabled>Tag wählen</option>
      <option v-for="d in dayOptions" :key="d" :value="d">{{ d }}</option>
    </select>

    <!-- Time Input -->
    <input
      v-model="time"
      type="text"
      placeholder="z.B. 18:00 - 20:00"
      class="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
    />

    <!-- Location Select -->
    <select
      v-model="locationId"
      class="flex-1 px-2 py-1.5 bg-white border border-gray-300 rounded text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
    >
      <option :value="null">Kein Standort</option>
      <option v-for="loc in locations" :key="loc.id" :value="loc.id">
        {{ loc.name }}
      </option>
    </select>

    <!-- Delete Button -->
    <button
      type="button"
      class="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors shrink-0"
      title="Trainingszeit löschen"
      @click="handleDelete"
    >
      <FontAwesomeIcon icon="trash" />
    </button>
  </div>
</template>
