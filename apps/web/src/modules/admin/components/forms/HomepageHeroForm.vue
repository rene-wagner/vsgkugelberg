<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHomepageContentStore } from '../../stores/homepageContentStore';
import type { HomepageContent, MediaItem } from '../../types/homepage-content.types';
import AdminButton from '../AdminButton.vue';
import ImageSelector from '../ImageSelector.vue';

const props = defineProps<{
  homepageContent: HomepageContent;
}>();

const homepageContentStore = useHomepageContentStore();

const heroTag = ref('');
const heroLogoId = ref<number | null>(null);
const heroLogo = ref<MediaItem | null>(null);

watch(
  () => props.homepageContent,
  (newContent) => {
    if (newContent) {
      heroTag.value = newContent.heroTag;
      heroLogoId.value = newContent.heroLogoId ?? null;
      heroLogo.value = newContent.heroLogo ?? null;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await homepageContentStore.updateHomepageContent({
    heroTag: heroTag.value,
    heroLogoId: heroLogoId.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Hero Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="heroTag"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Tag / Badge
          </label>
          <input
            id="heroTag"
            v-model="heroTag"
            type="text"
            required
            placeholder="z.B. Willkommen bei VSG Kugelberg"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Logo (Optional) </label>
          <ImageSelector
            v-model:media-id="heroLogoId"
            v-model:media="heroLogo"
            label="Logo auswählen oder hochladen"
            aspect-ratio="aspect-square"
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
