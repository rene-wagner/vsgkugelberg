<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import {
  useTagsStore,
  type Tag,
  type CreateTagData,
  type UpdateTagData,
} from '../stores/tagsStore';

const props = defineProps<{
  tag: Tag | null;
  isEditMode: boolean;
}>();

const router = useRouter();
const tagsStore = useTagsStore();

const name = ref('');
const error = ref('');
const isSubmitting = ref(false);

// Watch for tag prop changes to populate form
watch(
  () => props.tag,
  (newTag) => {
    if (newTag) {
      name.value = newTag.name;
    }
  },
  { immediate: true },
);

const canSubmit = computed(() => {
  return name.value.trim() !== '';
});

async function handleSubmit() {
  if (!canSubmit.value) return;

  error.value = '';
  isSubmitting.value = true;

  try {
    if (props.isEditMode && props.tag) {
      // Update existing tag
      const updateData: UpdateTagData = {
        name: name.value,
      };

      const result = await tagsStore.updateTag(props.tag.slug, updateData);
      if (result) {
        router.push('/admin/tags');
      } else {
        error.value = tagsStore.error || 'Fehler beim Aktualisieren des Tags';
      }
    } else {
      // Create new tag
      const createData: CreateTagData = {
        name: name.value,
      };

      const result = await tagsStore.createTag(createData);
      if (result) {
        router.push('/admin/tags');
      } else {
        error.value = tagsStore.error || 'Fehler beim Erstellen des Tags';
      }
    }
  } catch {
    error.value = 'Ein unerwarteter Fehler ist aufgetreten';
  } finally {
    isSubmitting.value = false;
  }
}

async function handleDelete() {
  if (!props.tag) return;

  const confirmed = window.confirm(
    `Mochtest du den Tag "${props.tag.name}" wirklich loschen?`,
  );
  if (!confirmed) return;

  isSubmitting.value = true;
  const success = await tagsStore.deleteTag(props.tag.slug);
  isSubmitting.value = false;

  if (success) {
    router.push('/admin/tags');
  } else {
    error.value = tagsStore.error || 'Fehler beim Loschen des Tags';
  }
}

function handleCancel() {
  router.push('/admin/tags');
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

    <!-- Tag Data Section -->
    <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">
        TAGDATEN
      </h2>

      <div class="space-y-6">
        <!-- Name -->
        <div>
          <label
            for="name"
            class="block font-body font-extralight text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
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
          Tag loschen
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
