<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AdminIconButton from './AdminIconButton.vue';
import type { HomepageStat } from '../types/homepage-content.types';

const props = defineProps<{
  stat: HomepageStat;
}>();

const emit = defineEmits<{
  (e: 'update', data: { label: string; value: string }): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'label' | 'value', inputValue: string) {
  emit('update', {
    label: field === 'label' ? inputValue : props.stat.label,
    value: field === 'value' ? inputValue : props.stat.value,
  });
}
</script>

<template>
  <div class="flex items-center gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group">
    <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400">
      <FontAwesomeIcon icon="grip" />
    </div>

    <div class="flex-1 grid grid-cols-12 gap-4">
      <div class="col-span-6">
        <input
          :value="stat.label"
          type="text"
          placeholder="Label (z.B. Mitglieder)"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('label', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="col-span-6">
        <input
          :value="stat.value"
          type="text"
          placeholder="Wert (z.B. 500+)"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('value', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Statistik löschen"
      @click="emit('delete')"
    />
  </div>
</template>
