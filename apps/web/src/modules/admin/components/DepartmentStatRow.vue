<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import AdminIconButton from './AdminIconButton.vue';
import type { DepartmentStat } from '../types/department-extended.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

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
    <div class="cursor-grab text-gray-400 hover:text-gray-600 drag-handle shrink-0">
      <FontAwesomeIcon icon="grip" />
    </div>

    <!-- Label Input -->
    <div class="flex-1">
      <VsgInput
        v-model="label"
        id="stat-label"
        type="text"
        placeholder="Label (z.B. Mitglieder)"
        variant="inline"
      />
    </div>

    <!-- Value Input -->
    <div class="flex-1">
      <VsgInput
        v-model="value"
        id="stat-value"
        type="text"
        placeholder="Wert (z.B. 150+)"
        variant="inline"
      />
    </div>

    <!-- Delete Button -->
    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Statistik löschen"
      @click="handleDelete"
    />
  </div>
</template>
