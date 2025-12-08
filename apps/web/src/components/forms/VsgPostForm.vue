<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import VsgMarkdownEditor from '@/components/VsgMarkdownEditor.vue';
import { VsgIconSpinner } from '@/components/icons';

export type PostFormPayload = {
  title: string;
  content: string;
  published: boolean;
};

export type PostFormInitialData = {
  title: string;
  content: string | null;
  published: boolean;
};

const props = defineProps<{
  loading?: boolean;
  error?: string | null;
  initialData?: PostFormInitialData | null;
}>();

const emit = defineEmits<{
  save: [payload: PostFormPayload];
  cancel: [];
}>();

const title = ref(props.initialData?.title ?? '');
const content = ref(props.initialData?.content ?? '');
const published = ref(props.initialData?.published ?? false);

// Watch for initialData changes to reset form
watch(
  () => props.initialData,
  (newData) => {
    title.value = newData?.title ?? '';
    content.value = newData?.content ?? '';
    published.value = newData?.published ?? false;
  }
);

const titleError = ref<string | null>(null);
const contentError = ref<string | null>(null);

const isValid = computed(() => {
  return title.value.trim().length >= 3 && content.value.trim().length > 0;
});

const validateForm = (): boolean => {
  let valid = true;

  // Validate title
  if (!title.value.trim()) {
    titleError.value = 'Titel ist erforderlich';
    valid = false;
  } else if (title.value.trim().length < 3) {
    titleError.value = 'Titel muss mindestens 3 Zeichen lang sein';
    valid = false;
  } else if (title.value.trim().length > 200) {
    titleError.value = 'Titel darf maximal 200 Zeichen lang sein';
    valid = false;
  } else {
    titleError.value = null;
  }

  // Validate content
  if (!content.value.trim()) {
    contentError.value = 'Inhalt ist erforderlich';
    valid = false;
  } else {
    contentError.value = null;
  }

  return valid;
};

const handleSave = () => {
  if (!validateForm()) {
    return;
  }

  emit('save', {
    title: title.value.trim(),
    content: content.value,
    published: published.value,
  });
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <form class="vsg-post-form" @submit.prevent="handleSave">
    <!-- Error Alert -->
    <div
      v-if="error"
      class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm"
    >
      {{ error }}
    </div>

    <!-- Title Field -->
    <div class="mb-4">
      <label for="post-title" class="block text-sm font-medium text-gray-700 mb-1">
        Titel <span class="text-red-500">*</span>
      </label>
      <input
        id="post-title"
        v-model="title"
        type="text"
        :disabled="loading"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#00295e] focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        :class="{ 'border-red-500': titleError }"
        placeholder="Beitragstitel eingeben..."
        @input="titleError = null"
      />
      <p v-if="titleError" class="mt-1 text-sm text-red-500">{{ titleError }}</p>
    </div>

    <!-- Content Field -->
    <div class="mb-4">
      <label for="post-content" class="block text-sm font-medium text-gray-700 mb-1">
        Inhalt <span class="text-red-500">*</span>
      </label>
      <VsgMarkdownEditor
        v-model="content"
        :disabled="loading"
        placeholder="Beitragsinhalt in Markdown schreiben..."
        :class="{ 'ring-2 ring-red-500 rounded-lg': contentError }"
        @update:model-value="contentError = null"
      />
      <p v-if="contentError" class="mt-1 text-sm text-red-500">{{ contentError }}</p>
    </div>

    <!-- Published Toggle -->
    <div class="mb-6">
      <label class="flex items-center gap-3 cursor-pointer">
        <input
          v-model="published"
          type="checkbox"
          :disabled="loading"
          class="w-5 h-5 text-[#00295e] border-gray-300 rounded focus:ring-[#00295e] disabled:cursor-not-allowed"
        />
        <span class="text-sm font-medium text-gray-700">Sofort veroffentlichen</span>
      </label>
      <p class="mt-1 text-xs text-gray-500 ml-8">
        Wenn nicht aktiviert, wird der Beitrag als Entwurf gespeichert.
      </p>
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
        <VsgIconSpinner v-if="loading" size="h-4 w-4" />
        <span>{{ loading ? 'Speichern...' : 'Speichern' }}</span>
      </button>
    </div>
  </form>
</template>

<style scoped>
.vsg-post-form {
  padding: 1rem;
}
</style>
