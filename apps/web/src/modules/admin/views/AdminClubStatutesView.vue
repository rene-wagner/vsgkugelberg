<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useStatutesStore } from '../stores/statutesStore';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';
import { VsgAlert } from '@/shared/components';
import AdminButton from '../components/AdminButton.vue';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const statutesStore = useStatutesStore();

const content = ref('');

async function handleSave() {
  await statutesStore.updateStatutes({ content: content.value });
}

// Watch for statutes changes to update local content
watch(
  () => statutesStore.statutes,
  (newStatutes) => {
    if (newStatutes) {
      content.value = newStatutes.content;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await statutesStore.fetchStatutes();
});
</script>

<template>
  <div>
    <AdminPageHeader
      title="SATZUNG"
      description="Verwaltung der Vereinssatzung"
    />

    <!-- Success/Error Messages -->
    <VsgAlert
      v-if="statutesStore.successMessage"
      variant="success"
      :message="statutesStore.successMessage"
      dismissible
      :auto-dismiss="5000"
      class="mb-6"
      @dismiss="statutesStore.clearMessages"
    />

    <VsgAlert
      v-if="statutesStore.error"
      variant="error"
      :message="statutesStore.error"
      dismissible
      class="mb-6"
      @dismiss="statutesStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="statutesStore.isLoading && !statutesStore.statutes" />

    <!-- Content Editor -->
    <div
      v-else
      class="max-w-4xl"
    >
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">SATZUNGSTEXT</h2>

        <div class="mb-6">
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Inhalt (Markdown) </label>
          <VsgMarkdownEditor
            v-model="content"
            placeholder="Satzungstext eingeben..."
            min-height="500px"
          />
        </div>

        <p class="text-sm text-gray-500 font-body">
          Der Text wird als Markdown gespeichert und auf der öffentlichen Seite entsprechend formatiert angezeigt.
        </p>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end">
        <AdminButton
          size="large"
          :disabled="statutesStore.isSaving"
          :loading="statutesStore.isSaving"
          @click="handleSave"
        >
          {{ statutesStore.isSaving ? 'Speichern...' : 'Satzung speichern' }}
        </AdminButton>
      </div>
    </div>
  </div>
</template>
