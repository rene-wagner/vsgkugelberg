<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus';
import type { ChronicleGroup, ChronicleEntry } from '../types/history.types';
import HistoryChronicleEntryRow from './HistoryChronicleEntryRow.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  group: ChronicleGroup;
}>();

const emit = defineEmits<{
  (e: 'update', data: ChronicleGroup): void;
  (e: 'delete'): void;
}>();

function handleHeadlineUpdate(value: string) {
  emit('update', { ...props.group, headline: value });
}

function handleEntriesUpdate(newEntries: ChronicleEntry[]) {
  emit('update', { ...props.group, content: newEntries });
}

function addEntry() {
  const newEntries = [...props.group.content, { year: '', description: '' }];
  handleEntriesUpdate(newEntries);
}

function updateEntry(index: number, data: ChronicleEntry) {
  const newEntries = [...props.group.content];
  newEntries[index] = data;
  handleEntriesUpdate(newEntries);
}

function deleteEntry(index: number) {
  const newEntries = [...props.group.content];
  newEntries.splice(index, 1);
  handleEntriesUpdate(newEntries);
}
</script>

<template>
  <div class="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
    <div class="flex items-center gap-4">
      <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400">
        <FontAwesomeIcon icon="grip" />
      </div>

      <input
        :value="group.headline"
        type="text"
        placeholder="Gruppenüberschrift (z.B. 1990 - 2000)"
        class="flex-1 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm text-vsg-blue-900 font-display tracking-wider focus:border-vsg-blue-600 outline-none"
        @input="handleHeadlineUpdate(($event.target as HTMLInputElement).value)"
      />

      <button
        type="button"
        class="text-gray-400 hover:text-red-600 transition-colors"
        @click="emit('delete')"
      >
        <FontAwesomeIcon icon="trash" />
      </button>
    </div>

    <div class="pl-9 space-y-3">
      <div class="text-xs font-body font-normal text-vsg-blue-600 uppercase tracking-widest mb-2">Ereignisse</div>

      <VueDraggable
        :model-value="group.content"
        handle=".drag-handle"
        :animation="200"
        class="space-y-2"
        @update:model-value="handleEntriesUpdate"
      >
        <HistoryChronicleEntryRow
          v-for="(entry, index) in group.content"
          :key="index"
          :entry="entry"
          @update="(data) => updateEntry(index, data)"
          @delete="deleteEntry(index)"
        />
      </VueDraggable>

      <button
        type="button"
        class="w-full py-2 border border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-xs flex items-center justify-center gap-2"
        @click="addEntry"
      >
        <FontAwesomeIcon icon="plus" />
        Ereignis hinzufügen
      </button>
    </div>
  </div>
</template>
