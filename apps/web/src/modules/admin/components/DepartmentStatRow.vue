<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type { DepartmentStat } from '../types/department-extended.types';

const props = defineProps<{
  stat: DepartmentStat;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', data: { label: string; value: string }): void;
  (e: 'delete'): void;
}>();

const label = ref(props.stat.label);
const value = ref(props.stat.value);

// Track if values changed from original
const hasChanges = computed(() => {
  if (props.isNew) return true;
  return label.value !== props.stat.label || value.value !== props.stat.value;
});

// Watch for external stat changes (e.g., after save)
watch(
  () => props.stat,
  (newStat) => {
    label.value = newStat.label;
    value.value = newStat.value;
  },
);

// Emit updates when values change
watch([label, value], () => {
  emit('update', { label: label.value, value: value.value });
});

function handleDelete() {
  emit('delete');
}

// Expose hasChanges for parent component
defineExpose({ hasChanges });
</script>

<template>
  <div
    class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 group"
    :class="{ 'border-vsg-lime-500 bg-vsg-lime-50': isNew }"
  >
    <!-- Drag Handle -->
    <div
      class="cursor-grab text-gray-400 hover:text-gray-600 drag-handle flex-shrink-0"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M4 8h16M4 16h16"
        />
      </svg>
    </div>

    <!-- Label Input -->
    <div class="flex-1">
      <input
        v-model="label"
        type="text"
        placeholder="Label (z.B. Mitglieder)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
      />
    </div>

    <!-- Value Input -->
    <div class="flex-1">
      <input
        v-model="value"
        type="text"
        placeholder="Wert (z.B. 150+)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
      />
    </div>

    <!-- Delete Button -->
    <button
      type="button"
      class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
      title="Statistik löschen"
      @click="handleDelete"
    >
      <svg
        class="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
        />
      </svg>
    </button>
  </div>
</template>
