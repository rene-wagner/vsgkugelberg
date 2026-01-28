<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import VsgSectionHeader from '@shared/components/VsgSectionHeader.vue';
import DepartmentCard from './DepartmentCard.vue';
import { useDefaultDepartmentsStore, getMediaUrl } from '../stores/departmentsStore';

interface Props {
  headline?: string;
  description?: string;
  subtitle?: string;
}

withDefaults(defineProps<Props>(), {
  headline: 'ABTEILUNGEN',
  description: 'Entdecke unsere vielfältigen Sportangebote und finde die passende Abteilung für dich.',
  subtitle: 'Unsere Abteilungen',
});

const departmentsStore = useDefaultDepartmentsStore();
const { departments, isLoading, error } = storeToRefs(departmentsStore);

onMounted(() => {
  departmentsStore.fetchDepartments();
});
</script>

<template>
  <section class="relative bg-white py-32">
    <div class="mx-auto max-w-7xl px-6">
      <VsgSectionHeader
        :subtitle="subtitle"
        :title="headline"
        class="mb-20"
      />

      <!-- Loading State -->
      <div
        v-if="isLoading"
        class="flex justify-center py-12"
      >
        <div class="h-12 w-12 animate-spin rounded-full border-4 border-vsg-blue-200 border-t-vsg-blue-600"></div>
      </div>

      <!-- Error State -->
      <div
        v-else-if="error"
        class="mx-auto max-w-2xl rounded-lg bg-red-50 p-6 text-center"
      >
        <p class="text-red-600">{{ error }}</p>
        <button
          class="mt-4 rounded bg-vsg-blue-600 px-4 py-2 text-white hover:bg-vsg-blue-700"
          @click="departmentsStore.fetchDepartments()"
        >
          Erneut versuchen
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-else-if="departments.length === 0"
        class="mx-auto max-w-2xl rounded-lg bg-gray-50 p-12 text-center"
      >
        <p class="text-lg text-gray-600">Derzeit sind keine Abteilungen verfugbar.</p>
      </div>

      <!-- Departments Grid -->
      <div
        v-else
        class="mx-auto grid max-w-4xl gap-8 md:grid-cols-2"
      >
        <DepartmentCard
          v-for="department in departments"
          :key="department.id"
          :title="department.name.toUpperCase()"
          :description="department.shortDescription"
          :href="`/abteilung/${department.slug}`"
        >
          <template #icon>
            <img
              v-if="department.icon"
              :src="getMediaUrl(department.icon)"
              :alt="department.name"
              class="h-8 w-8 object-contain"
              style="filter: invert(27%) sepia(51%) saturate(2878%) hue-rotate(200deg) brightness(89%) contrast(91%)"
            />
            <FontAwesomeIcon
              v-else
              icon="circle"
              class="text-vsg-blue-600"
            />
          </template>
        </DepartmentCard>
      </div>
    </div>
  </section>
</template>
