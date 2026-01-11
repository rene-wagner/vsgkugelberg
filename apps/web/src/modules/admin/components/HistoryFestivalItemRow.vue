<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import type { FestivalItem } from '../types/history.types';

const props = defineProps<{
  item: FestivalItem;
}>();

const emit = defineEmits<{
  (e: 'update', data: { headline: string; text: string }): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'headline' | 'text', value: string) {
  emit('update', {
    headline: field === 'headline' ? value : props.item.headline,
    text: field === 'text' ? value : props.item.text,
  });
}
</script>

<template>
  <div class="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group">
    <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2">
      <FontAwesomeIcon icon="grip" />
    </div>

    <div class="flex-1 space-y-3">
      <input
        :value="item.headline"
        type="text"
        placeholder="Überschrift (z.B. RADTOUREN)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 font-display tracking-widest focus:border-vsg-blue-600 outline-none"
        @input="handleInput('headline', ($event.target as HTMLInputElement).value)"
      />

      <textarea
        :value="item.text"
        placeholder="Beschreibung der Veranstaltung..."
        rows="4"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
        @input="handleInput('text', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <button type="button" class="text-gray-400 hover:text-red-600 transition-colors mt-2" @click="emit('delete')">
      <FontAwesomeIcon icon="trash" />
    </button>
  </div>
</template>
