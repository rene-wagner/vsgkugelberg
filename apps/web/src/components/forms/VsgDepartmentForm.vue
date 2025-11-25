<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import VsgMarkdownEditor from '@/components/VsgMarkdownEditor.vue';

export type DepartmentFormPayload = {
  name: string;
  shortDescription: string;
  longDescription: string;
};

export type DepartmentFormInitialData = {
  name: string;
  shortDescription: string;
  longDescription: string;
};

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
  initialData?: DepartmentFormInitialData | null;
}>();

const emit = defineEmits<{
  save: [payload: DepartmentFormPayload];
  cancel: [];
}>();

const name = ref(props.initialData?.name ?? '');
const shortDescription = ref(props.initialData?.shortDescription ?? '');
const longDescription = ref(props.initialData?.longDescription ?? '');

// Watch for initialData changes to reset form
watch(
  () => props.initialData,
  (newData) => {
    name.value = newData?.name ?? '';
    shortDescription.value = newData?.shortDescription ?? '';
    longDescription.value = newData?.longDescription ?? '';
  }
);

const nameError = ref<string | null>(null);
const shortDescriptionError = ref<string | null>(null);

const isValid = computed(() => {
  return name.value.trim().length >= 2 && shortDescription.value.trim().length > 0;
});

const validateForm = (): boolean => {
  let valid = true;

  // Validate name
  if (!name.value.trim()) {
    nameError.value = 'Name ist erforderlich';
    valid = false;
  } else if (name.value.trim().length < 2) {
    nameError.value = 'Name muss mindestens 2 Zeichen lang sein';
    valid = false;
  } else if (name.value.trim().length > 100) {
    nameError.value = 'Name darf maximal 100 Zeichen lang sein';
    valid = false;
  } else {
    nameError.value = null;
  }

  // Validate short description
  if (!shortDescription.value.trim()) {
    shortDescriptionError.value = 'Kurzbeschreibung ist erforderlich';
    valid = false;
  } else if (shortDescription.value.trim().length > 255) {
    shortDescriptionError.value = 'Kurzbeschreibung darf maximal 255 Zeichen lang sein';
    valid = false;
  } else {
    shortDescriptionError.value = null;
  }

  return valid;
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    name: name.value.trim(),
    shortDescription: shortDescription.value.trim(),
    longDescription: longDescription.value,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <form class="vsg-department-form" @submit.prevent="handleSave">
    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ error }}
    </div>

    <!-- Name Field -->
    <div class="mb-4">
      <label for="department-name" class="block text-sm font-medium text-gray-700 mb-1">
        Name <span class="text-red-500">*</span>
      </label>
      <input
        id="department-name"
        v-model="name"
        type="text"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': nameError }"
        placeholder="Abteilungsname eingeben..."
        @input="nameError = null"
      />
      <p v-if="nameError" class="mt-1 text-sm text-red-500">{{ nameError }}</p>
    </div>

    <!-- Short Description Field -->
    <div class="mb-4">
      <label
        for="department-short-description"
        class="block text-sm font-medium text-gray-700 mb-1"
      >
        Kurzbeschreibung <span class="text-red-500">*</span>
      </label>
      <input
        id="department-short-description"
        v-model="shortDescription"
        type="text"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': shortDescriptionError }"
        placeholder="Kurze Beschreibung der Abteilung..."
        @input="shortDescriptionError = null"
      />
      <p v-if="shortDescriptionError" class="mt-1 text-sm text-red-500">
        {{ shortDescriptionError }}
      </p>
    </div>

    <!-- Long Description Field -->
    <div class="mb-4">
      <label for="department-long-description" class="block text-sm font-medium text-gray-700 mb-1">
        Beschreibung
      </label>
      <VsgMarkdownEditor
        v-model="longDescription"
        :disabled="loading"
        placeholder="Ausführliche Beschreibung in Markdown schreiben..."
      />
    </div>

    <!-- Action Buttons -->
    <div class="flex gap-3 justify-end">
      <button
        type="button"
        :disabled="loading"
        class="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        @click="handleCancel"
      >
        Abbrechen
      </button>
      <button
        type="submit"
        :disabled="loading || !isValid"
        class="px-4 py-2 text-white bg-[#00295e] hover:bg-[#003d8a] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        <svg
          v-if="loading"
          class="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          ></circle>
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
        <span>{{ loading ? 'Speichern...' : 'Speichern' }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.vsg-department-form {
  padding: 1rem;
}
</style>
