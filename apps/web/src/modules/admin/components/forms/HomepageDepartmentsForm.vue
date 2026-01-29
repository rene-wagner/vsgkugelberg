<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHomepageContentStore } from '../../stores/homepageContentStore';
import type { HomepageContent } from '../../types/homepage-content.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import AdminButton from '../AdminButton.vue';

const props = defineProps<{
  homepageContent: HomepageContent;
}>();

const homepageContentStore = useHomepageContentStore();

const departmentsHeadline = ref('');
const departmentsSubtitle = ref('');
const departmentsDescription = ref('');

watch(
  () => props.homepageContent,
  (newContent) => {
    if (newContent) {
      departmentsHeadline.value = newContent.departmentsHeadline;
      departmentsSubtitle.value = newContent.departmentsSubtitle;
      departmentsDescription.value = newContent.departmentsDescription;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await homepageContentStore.updateHomepageContent({
    departmentsHeadline: departmentsHeadline.value,
    departmentsSubtitle: departmentsSubtitle.value,
    departmentsDescription: departmentsDescription.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Abteilungen Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="departmentsSubtitle"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Untertitel
          </label>
          <input
            id="departmentsSubtitle"
            v-model="departmentsSubtitle"
            type="text"
            required
            placeholder="z.B. Unsere Abteilungen"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="departmentsHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="departmentsHeadline"
            v-model="departmentsHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="departmentsDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung
          </label>
          <VsgMarkdownEditor
            id="departmentsDescription"
            v-model="departmentsDescription"
            placeholder="Beschreibung des Abteilungen-Bereichs..."
            min-height="150px"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <AdminButton
        type="submit"
        size="large"
        :disabled="homepageContentStore.isSaving"
        :loading="homepageContentStore.isSaving"
      >
        {{ homepageContentStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </AdminButton>
    </div>
  </form>
</template>
