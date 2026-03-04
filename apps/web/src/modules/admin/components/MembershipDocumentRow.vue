<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AdminIconButton from './AdminIconButton.vue';
import type { MembershipDocument } from '../types/membership.types';

const props = defineProps<{
  item: MembershipDocument;
}>();

const emit = defineEmits<{
  (e: 'update', data: MembershipDocument): void;
  (e: 'delete'): void;
}>();

function handleInput(field: 'title' | 'url', value: string) {
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
        placeholder="Dokumenttitel (z.B. Aufnahmeantrag)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 font-display tracking-widest focus:border-vsg-blue-600 outline-none"
        @input="handleInput('title', ($event.target as HTMLInputElement).value)"
      />

      <input
        :value="item.url"
        type="text"
        placeholder="URL oder Dateipfad (z.B. /files/aufnahmeantrag.pdf)"
        class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-700 focus:border-vsg-blue-600 outline-none"
        @input="handleInput('url', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Element löschen"
      @click="emit('delete')"
    />
  </div>
</template>
