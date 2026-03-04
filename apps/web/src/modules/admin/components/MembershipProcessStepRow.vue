<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AdminIconButton from './AdminIconButton.vue';
import type { MembershipProcessStep } from '../types/membership.types';

const props = defineProps<{
  item: MembershipProcessStep;
}>();

const emit = defineEmits<{
  (e: 'update', data: MembershipProcessStep): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'title' | 'description', value: string) {
  emit('update', {
    ...props.item,
    [field]: value,
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
        :value="item.title"
        type="text"
        placeholder="Schritttitel (z.B. Kontakt aufnehmen)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 font-display tracking-widest focus:border-vsg-blue-600 outline-none"
        @input="handleInput('title', ($event.target as HTMLInputElement).value)"
      />

      <textarea
        :value="item.description"
        placeholder="Beschreibung des Schritts..."
        rows="3"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
        @input="handleInput('description', ($event.target as HTMLTextAreaElement).value)"
      ></textarea>
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Element löschen"
      @click="emit('delete')"
    />
  </div>
</template>
