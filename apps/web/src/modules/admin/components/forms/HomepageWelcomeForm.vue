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

const welcomeText = ref('');

watch(
  () => props.homepageContent,
  (newContent) => {
    if (newContent) {
      welcomeText.value = newContent.welcomeText ?? '';
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await homepageContentStore.updateHomepageContent({
    welcomeText: welcomeText.value || null,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Willkommenstext</h2>

      <div class="space-y-6">
        <div>
          <label
            for="welcomeText"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Begrüßungstext
          </label>
          <VsgMarkdownEditor
            id="welcomeText"
            v-model="welcomeText"
            placeholder="Willkommenstext für die Startseite..."
            min-height="200px"
          />
          <p class="mt-2 text-xs text-gray-500">
            Dieser Text wird auf der Startseite zwischen dem Hero-Bereich und den Statistiken angezeigt. Lassen Sie das Feld leer, um den Bereich
            auszublenden.
          </p>
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
