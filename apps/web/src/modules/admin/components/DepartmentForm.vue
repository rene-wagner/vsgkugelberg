<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  useDepartmentsStore,
  type Department,
  type CreateDepartmentData,
  type UpdateDepartmentData,
} from '../stores/departmentsStore';

const props = defineProps<{
  department: Department | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const departmentsStore = useDepartmentsStore();

const name = ref('');
const shortDescription = ref('');
const longDescription = ref('');
const error = ref('');
const isSubmitting = ref(false);

// Watch for department prop changes to populate form
watch(
  () => props.department,
  (newDepartment) => {
    if (newDepartment) {
      name.value = newDepartment.name;
      shortDescription.value = newDepartment.shortDescription;
      longDescription.value = newDepartment.longDescription;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return (
    name.value.trim() !== '' &&
    shortDescription.value.trim() !== '' &&
    longDescription.value.trim() !== ''
  );
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.department) {
      // Update existing department
      const updateData: UpdateDepartmentData = {
        name: name.value,
        shortDescription: shortDescription.value,
        longDescription: longDescription.value,
      };

      const result = await departmentsStore.updateDepartment(
        props.department.slug,
        updateData,
      );
      if (result) {
        router.push('/admin/departments');
      } else {
        error.value =
          departmentsStore.error || 'Fehler beim Aktualisieren der Abteilung';
      }
    } else {
      // Create new department
      const createData: CreateDepartmentData = {
        name: name.value,
        shortDescription: shortDescription.value,
        longDescription: longDescription.value,
      };

      const result = await departmentsStore.createDepartment(createData);
      if (result) {
        router.push('/admin/departments');
      } else {
        error.value =
          departmentsStore.error || 'Fehler beim Erstellen der Abteilung';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.department) return;

  const confirmed = window.confirm(
    `Mochtest du die Abteilung "${props.department.name}" wirklich löschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await departmentsStore.deleteDepartment(
    props.department.slug,
  );
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/departments');
  } else {
    error.value = departmentsStore.error || 'Fehler beim löschen der Abteilung';
  }
}

function handleCancel() {
  router.push('/admin/departments');
}
</script>

<template>
  <form class="max-w-3xl" @submit.prevent="handleSubmit">
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Department Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        ABTEILUNGSDATEN
      </h2>

      <div class="space-y-6">
        <!-- Name -->
        <div>
          <label
            for="name"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Name <span class="text-red-500">*</span>
          </label>
          <input
            id="name"
            v-model="name"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="z.B. Badminton"
          />
        </div>

        <!-- Short Description -->
        <div>
          <label
            for="shortDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Kurzbeschreibung <span class="text-red-500">*</span>
          </label>
          <input
            id="shortDescription"
            v-model="shortDescription"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
            placeholder="Kurze Beschreibung der Abteilung"
          />
        </div>

        <!-- Long Description -->
        <div>
          <label
            for="longDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Langbeschreibung <span class="text-red-500">*</span>
          </label>
          <textarea
            id="longDescription"
            v-model="longDescription"
            required
            rows="6"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600 resize-none"
            placeholder="Ausfuhrliche Beschreibung der Abteilung..."
          ></textarea>
        </div>
      </div>
    </div>

    <!-- Form Actions -->
    <div
      class="flex items-center justify-between border-t border-gray-200 pt-6"
    >
      <button
        type="button"
        class="px-6 py-2.5 border border-gray-300 text-gray-600 font-body text-sm rounded-lg hover:bg-gray-50 transition-colors"
        @click="handleCancel"
      >
        Abbrechen
      </button>

      <div class="flex items-center gap-3">
        <button
          v-if="isEditMode"
          type="button"
          class="px-6 py-2.5 border border-red-300 text-red-600 font-body text-sm rounded-lg hover:bg-red-50 transition-colors"
          :disabled="isSubmitting"
          @click="handleDelete"
        >
          Abteilung löschen
        </button>
        <button
          type="submit"
          class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!canSubmit || isSubmitting"
        >
          {{ isSubmitting ? 'SPEICHERN...' : 'SPEICHERN' }}
        </button>
      </div>
    </div>
  </form>
</template>
