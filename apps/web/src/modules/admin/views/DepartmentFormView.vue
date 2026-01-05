<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  useDepartmentsStore,
  type DepartmentExtended,
} from '../stores/departmentsStore';
import { useDepartmentStatsStore } from '../stores/departmentStatsStore';
import { useDepartmentTrainingStore } from '../stores/departmentTrainingStore';
import { useDepartmentLocationsStore } from '../stores/departmentLocationsStore';
import { useDepartmentTrainersStore } from '../stores/departmentTrainersStore';
import DepartmentForm from '../components/DepartmentForm.vue';
import VsgTabNav, {
  type TabDefinition,
} from '@/shared/components/VsgTabNav.vue';
import DepartmentStatsEditor from '../components/DepartmentStatsEditor.vue';
import DepartmentTrainingEditor from '../components/DepartmentTrainingEditor.vue';
import DepartmentLocationsEditor from '../components/DepartmentLocationsEditor.vue';
import DepartmentTrainersEditor from '../components/DepartmentTrainersEditor.vue';

const route = useRoute();
const router = useRouter();
const departmentsStore = useDepartmentsStore();
const statsStore = useDepartmentStatsStore();
const trainingStore = useDepartmentTrainingStore();
const locationsStore = useDepartmentLocationsStore();
const trainersStore = useDepartmentTrainersStore();

const department = ref<DepartmentExtended | null>(null);
const isLoading = ref(false);
const activeTab = ref('grunddaten');

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

// Tab definitions - tabs 2-5 disabled in create mode
const tabs = computed<TabDefinition[]>(() => {
  const disabledInCreateMode = !isEditMode.value;
  const disabledTooltip = 'Speichere zuerst die Abteilung';

  return [
    { id: 'grunddaten', label: 'GRUNDDATEN' },
    {
      id: 'statistiken',
      label: 'STATISTIKEN',
      disabled: disabledInCreateMode,
      disabledTooltip,
    },
    {
      id: 'training',
      label: 'TRAINING',
      disabled: disabledInCreateMode,
      disabledTooltip,
    },
    {
      id: 'standorte',
      label: 'STANDORTE',
      disabled: disabledInCreateMode,
      disabledTooltip,
    },
    {
      id: 'trainer',
      label: 'TRAINER',
      disabled: disabledInCreateMode,
      disabledTooltip,
    },
  ];
});

// Initialize stores with department data
function initializeStores(dept: DepartmentExtended) {
  statsStore.setStats(dept.stats || []);
  trainingStore.setTrainingGroups(dept.trainingGroups || []);
  locationsStore.setLocations(dept.locations || []);
  trainersStore.setTrainers(dept.trainers || []);
}

// Clear stores when leaving (for future navigation guards)
/*
function _clearStores() {
  statsStore.clearStats();
  trainingStore.clearTrainingGroups();
  locationsStore.clearLocations();
  trainersStore.clearTrainers();
}
*/

onMounted(async () => {
  if (isEditMode.value) {
    isLoading.value = true;
    const slug = route.params.slug as string;
    const fetchedDepartment = await departmentsStore.fetchDepartment(slug);
    if (fetchedDepartment) {
      department.value = fetchedDepartment;
      initializeStores(fetchedDepartment);
    }
    isLoading.value = false;
  }
});

// Watch for route changes (e.g., after creating a department)
watch(
  () => route.params.slug,
  async (newSlug, oldSlug) => {
    if (newSlug && newSlug !== oldSlug) {
      isLoading.value = true;
      const fetchedDepartment = await departmentsStore.fetchDepartment(
        newSlug as string,
      );
      if (fetchedDepartment) {
        department.value = fetchedDepartment;
        initializeStores(fetchedDepartment);
      }
      isLoading.value = false;
    }
  },
);

// Handle successful department save (for create mode -> switch to edit mode)
async function handleDepartmentSaved(savedDepartment: DepartmentExtended) {
  department.value = savedDepartment;
  initializeStores(savedDepartment);

  // If we were in create mode, navigate to edit mode
  if (!isEditMode.value) {
    router.replace(`/admin/departments/${savedDepartment.slug}/edit`);
  }
}
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

    <!-- Content with Tabs -->
    <div v-else>
      <!-- Tab Navigation -->
      <VsgTabNav v-model:active-tab="activeTab" :tabs="tabs" />

      <!-- Tab Content -->
      <div class="max-w-4xl">
        <!-- Tab 1: Grunddaten (Basic Data) -->
        <div v-show="activeTab === 'grunddaten'">
          <DepartmentForm
            :department="department"
            :is-edit-mode="isEditMode"
            @saved="handleDepartmentSaved"
          />
        </div>

        <!-- Tab 2: Statistiken (Stats) -->
        <div v-show="activeTab === 'statistiken'">
          <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2
              class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6"
            >
              STATISTIKEN
            </h2>
            <DepartmentStatsEditor
              v-if="department"
              :department-slug="department.slug"
              :initial-stats="department.stats || []"
            />
          </div>
        </div>

        <!-- Tab 3: Training -->
        <div v-show="activeTab === 'training'">
          <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2
              class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6"
            >
              TRAININGSGRUPPEN
            </h2>
            <DepartmentTrainingEditor
              v-if="department"
              :department-slug="department.slug"
              :initial-groups="department.trainingGroups || []"
            />
          </div>
        </div>

        <!-- Tab 4: Standorte (Locations) -->
        <div v-show="activeTab === 'standorte'">
          <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2
              class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6"
            >
              STANDORTE
            </h2>
            <DepartmentLocationsEditor
              v-if="department"
              :department-slug="department.slug"
              :initial-locations="department.locations || []"
            />
          </div>
        </div>

        <!-- Tab 5: Trainer -->
        <div v-show="activeTab === 'trainer'">
          <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2
              class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6"
            >
              TRAINER
            </h2>
            <DepartmentTrainersEditor
              v-if="department"
              :department-slug="department.slug"
              :initial-trainers="department.trainers || []"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
