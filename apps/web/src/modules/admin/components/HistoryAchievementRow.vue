<script setup lang="ts">
import { ref, onMounted } from 'vue';
import VsgInput from '@/shared/components/VsgInput.vue';
import AdminIconButton from './AdminIconButton.vue';
import type { AchievementItem } from '../types/history.types';
import { useDepartmentsStore } from '../stores/departmentsStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  achievement: AchievementItem;
}>();

const emit = defineEmits<{
  (e: 'update', data: AchievementItem): void;
  (e: 'delete'): void;
}>();

const departmentsStore = useDepartmentsStore();
const categories = ref<{ id: string; label: string }[]>([{ id: 'Alle', label: 'ALLE' }]);

onMounted(async () => {
  if (departmentsStore.departments.length === 0) {
    await departmentsStore.fetchDepartments();
  }
  departmentsStore.departments.forEach((dept) => {
    categories.value.push({ id: dept.slug, label: dept.name.toUpperCase() });
  });
});

function handleInput(field: keyof AchievementItem, value: string) {
  emit('update', {
    ...props.achievement,
    [field]: value,
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
        <VsgInput
          :model-value="achievement.year"
          id="achievement-year"
          type="text"
          placeholder="Jahr"
          variant="inline"
          class="font-bold text-center"
          @update:model-value="handleInput('year', $event as string)"
        />
      </div>

      <div class="col-span-3">
        <select
          :value="achievement.category"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @change="handleInput('category', ($event.target as HTMLSelectElement).value)"
        >
          <option
            v-for="cat in categories"
            :key="cat.id"
            :value="cat.id"
          >
            {{ cat.label }}
          </option>
        </select>
      </div>

      <div class="col-span-7 space-y-2">
        <VsgInput
          :model-value="achievement.headline"
          id="achievement-headline"
          type="text"
          placeholder="Titel des Erfolgs"
          variant="inline"
          class="font-display tracking-widest"
          @update:model-value="handleInput('headline', $event as string)"
        />

        <textarea
          :value="achievement.description"
          placeholder="Details zum Erfolg..."
          rows="3"
          class="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm text-vsg-blue-900 focus:border-vsg-blue-600 outline-none"
          @input="handleInput('description', ($event.target as HTMLTextAreaElement).value)"
        ></textarea>
      </div>
    </div>

    <AdminIconButton
      icon="trash"
      variant="delete"
      title="Erfolg löschen"
      @click="emit('delete')"
    />
  </div>
</template>
