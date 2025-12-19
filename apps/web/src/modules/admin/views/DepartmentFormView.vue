<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  useDepartmentsStore,
  type Department,
} from '../stores/departmentsStore';
import DepartmentForm from '../components/DepartmentForm.vue';

const route = useRoute();
const departmentsStore = useDepartmentsStore();

const department = ref<Department | null>(null);
const isLoading = ref(false);

const isEditMode = computed(() => !!route.params.slug);
const pageTitle = computed(() =>
  isEditMode.value ? 'ABTEILUNG BEARBEITEN' : 'ABTEILUNG ERSTELLEN',
);
const pageSubtitle = computed(() =>
  isEditMode.value
    ? 'Bearbeite die Abteilungsdaten'
    : 'Erstelle eine neue Abteilung',
);
const breadcrumbAction = computed(() =>
  isEditMode.value ? 'Bearbeiten' : 'Erstellen',
);

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const slug = route.params.slug as string;
    department.value = await departmentsStore.fetchDepartment(slug);
    isLoading.value = false;
  }
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div
        class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2"
      >
        <router-link
          to="/admin/departments"
          class="hover:text-vsg-blue-600 transition-colors"
        >
          Abteilungen
        </router-link>
        <svg
          class="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span class="text-vsg-blue-600">{{ breadcrumbAction }}</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">
        {{ pageTitle }}
      </h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">
        {{ pageSubtitle }}
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex items-center justify-center py-12">
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Form -->
    <DepartmentForm
      v-else
      :department="department"
      :is-edit-mode="isEditMode"
    />
  </div>
</template>
