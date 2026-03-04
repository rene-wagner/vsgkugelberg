<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import AdminIconButton from './AdminIconButton.vue';
import type { MembershipDepartmentStat } from '../types/membership.types';

const props = defineProps<{
  item: MembershipDepartmentStat;
}>();

const emit = defineEmits<{
  (e: 'update', data: MembershipDepartmentStat): void;
  (e: 'delete'): void;
}>();

function handleInput(field: keyof MembershipDepartmentStat, value: string) {
  emit('update', {
    ...props.item,
    [field]: field === 'departmentName' ? value : Number(value),
  });
}
</script>

<template>
  <div class="flex items-start gap-4 p-4 bg-gray-50 border border-gray-200 rounded-lg group">
    <div class="drag-handle cursor-grab active:cursor-grabbing text-gray-400 mt-2">
      <FontAwesomeIcon icon="grip" />
    </div>

    <div class="flex-1 grid grid-cols-2 gap-3">
      <div class="col-span-2">
        <input
          :value="item.departmentName"
          type="text"
          placeholder="Abteilungsname (z.B. Badminton)"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 font-display tracking-widest focus:border-vsg-blue-600 outline-none"
          @input="handleInput('departmentName', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1">Gesamt</label>
        <input
          :value="item.totalCount"
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('totalCount', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1">Männer</label>
        <input
          :value="item.maleCount"
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('maleCount', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <div>
        <label class="block text-xs text-gray-500 mb-1">Frauen</label>
        <input
          :value="item.femaleCount"
          type="number"
          min="0"
          placeholder="0"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('femaleCount', ($event.target as HTMLInputElement).value)"
        />
      </div>
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Element löschen"
      @click="emit('delete')"
    />
  </div>
</template>
