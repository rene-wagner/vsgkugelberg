<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AdminIconButton from './AdminIconButton.vue';
import type { HistoryFact } from '../types/history.types';

const props = defineProps<{
  fact: HistoryFact;
  isNew?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update', data: { year: string; headline: string; description: string }): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'year' | 'headline' | 'description', value: string) {
  emit('update', {
    year: field === 'year' ? value : props.fact.year,
    headline: field === 'headline' ? value : props.fact.headline,
    description: field === 'description' ? value : props.fact.description,
  });
}
</script>

<template>
  <div class="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group">
    <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2">
      <FontAwesomeIcon icon="grip" />
    </div>

    <div class="flex-1 grid grid-cols-12 gap-4">
      <div class="col-span-2">
        <input
          :value="fact.year"
          type="text"
          placeholder="Jahr"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('year', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="col-span-4">
        <input
          :value="fact.headline"
          type="text"
          placeholder="Überschrift"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('headline', ($event.target as HTMLInputElement).value)"
        />
      </div>
      <div class="col-span-6">
        <textarea
          :value="fact.description"
          placeholder="Beschreibung"
          rows="3"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('description', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Fakt löschen"
      @click="emit('delete')"
    />
  </div>
</template>
