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

const postsHeadline = ref('');
const postsSubtitle = ref('');
const postsDescription = ref('');
const postsCount = ref(3);

watch(
  () => props.homepageContent,
  (newContent) => {
    if (newContent) {
      postsHeadline.value = newContent.postsHeadline;
      postsSubtitle.value = newContent.postsSubtitle;
      postsDescription.value = newContent.postsDescription;
      postsCount.value = newContent.postsCount;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await homepageContentStore.updateHomepageContent({
    postsHeadline: postsHeadline.value,
    postsSubtitle: postsSubtitle.value,
    postsDescription: postsDescription.value,
    postsCount: postsCount.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Beiträge / News Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="postsSubtitle"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Untertitel
          </label>
          <input
            id="postsSubtitle"
            v-model="postsSubtitle"
            type="text"
            required
            placeholder="z.B. Neuigkeiten"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="postsHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="postsHeadline"
            v-model="postsHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="postsDescription"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Beschreibung
          </label>
          <VsgMarkdownEditor
            id="postsDescription"
            v-model="postsDescription"
            placeholder="Beschreibung des News-Bereichs..."
            min-height="150px"
          />
        </div>

        <div>
          <label
            for="postsCount"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Anzahl anzuzeigender Beiträge
          </label>
          <input
            id="postsCount"
            v-model.number="postsCount"
            type="number"
            min="1"
            max="10"
            required
            class="form-input-custom w-32 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
          <p class="font-body text-xs text-gray-500 mt-1">Anzahl der neuesten Beiträge, die auf der Startseite angezeigt werden (1-10)</p>
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
