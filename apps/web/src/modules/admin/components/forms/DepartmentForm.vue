<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useDepartmentsStore, type DepartmentExtended, type CreateDepartmentData, type UpdateDepartmentData } from '../../stores/departmentsStore';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import SvgIconSelector from '../SvgIconSelector.vue';

const props = defineProps<{
  department: DepartmentExtended | null;
  isEditMode: boolean;
}>();

const emit = defineEmits<{
  (e: 'saved', department: DepartmentExtended): void;
}>();

const router = useRouter();
const departmentsStore = useDepartmentsStore();

const name = ref('');
const shortDescription = ref('');
const iconId = ref<number | null>(null);
const error = ref('');
const isSubmitting = ref(false);

// Watch for department prop changes to populate form
watch(
  () => props.department,
  (newDepartment) => {
    if (newDepartment) {
      name.value = newDepartment.name;
      shortDescription.value = newDepartment.shortDescription;
      iconId.value = newDepartment.iconId;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return name.value.trim() !== '' && shortDescription.value.trim() !== '';
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
        iconId: iconId.value,
      };

      const result = await departmentsStore.updateDepartment(props.department.slug, updateData);
      if (result) {
        // Fetch the full department with relations and emit
        const fullDepartment = await departmentsStore.fetchDepartment(result.slug);
        if (fullDepartment) {
          emit('saved', fullDepartment);
        }
      } else {
        error.value = departmentsStore.error || 'Fehler beim Aktualisieren der Abteilung';
      }
    } else {
      // Create new department
      const createData: CreateDepartmentData = {
        name: name.value,
        shortDescription: shortDescription.value,
      };
      // Only include iconId if set
      if (iconId.value !== null) {
        createData.iconId = iconId.value;
      }

      const result = await departmentsStore.createDepartment(createData);
      if (result) {
        // Fetch the full department with relations and emit
        const fullDepartment = await departmentsStore.fetchDepartment(result.slug);
        if (fullDepartment) {
          emit('saved', fullDepartment);
        }
      } else {
        error.value = departmentsStore.error || 'Fehler beim Erstellen der Abteilung';
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

  const confirmed = window.confirm(`Möchtest du die Abteilung "${props.department.name}" wirklich löschen?`);
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await departmentsStore.deleteDepartment(props.department.slug);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/abteilungen');
  } else {
    error.value = departmentsStore.error || 'Fehler beim Löschen der Abteilung';
  }
}

function handleCancel() {
  router.push('/admin/abteilungen');
}
</script>

<template>
  <form
    class="max-w-3xl"
    @submit.prevent="handleSubmit"
  >
    <!-- Error Message -->
    <div
      v-if="error"
      class="bg-red-50 border border-red-200 rounded-xl p-4 mb-6"
    >
      <p class="text-sm text-red-600 font-body">{{ error }}</p>
    </div>

    <!-- Department Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Abteilungsdaten</h2>

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
            Beschreibung <span class="text-red-500">*</span>
          </label>
          <VsgMarkdownEditor
            v-model="shortDescription"
            placeholder="Beschreibung der Abteilung..."
            min-height="250px"
          />
        </div>
      </div>
    </div>

    <!-- Icon Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">ICON</h2>

      <div>
        <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Abteilungs-Icon (SVG) </label>
        <SvgIconSelector
          v-model="iconId"
          :current-icon="department?.icon ?? null"
        />
      </div>
    </div>

    <!-- Form Actions -->
    <div class="flex items-center justify-between border-t border-gray-200 pt-6">
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
          {{ isSubmitting ? 'Speichern...' : 'Speichern' }}
        </button>
      </div>
    </div>
  </form>
</template>
