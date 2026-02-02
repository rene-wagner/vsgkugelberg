<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useSportInsuranceStore } from '../stores/sportInsuranceStore';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';
import { VsgAlert } from '@/shared/components';
import AdminButton from '../components/AdminButton.vue';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const sportInsuranceStore = useSportInsuranceStore();

const content = ref('');

async function handleSave() {
  await sportInsuranceStore.updateSportInsurance({ content: content.value });
}

// Watch for sport insurance changes to update local content
watch(
  () => sportInsuranceStore.sportInsurance,
  (newSportInsurance) => {
    if (newSportInsurance) {
      content.value = newSportInsurance.content;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await sportInsuranceStore.fetchSportInsurance();
});
</script>

<template>
  <div>
    <AdminPageHeader
      title="SPORTVERSICHERUNG"
      description="Verwaltung der Sportversicherungsinformationen"
    />

    <!-- Success/Error Messages -->
    <VsgAlert
      v-if="sportInsuranceStore.successMessage"
      variant="success"
      :message="sportInsuranceStore.successMessage"
      dismissible
      :auto-dismiss="5000"
      class="mb-6"
      @dismiss="sportInsuranceStore.clearMessages"
    />

    <VsgAlert
      v-if="sportInsuranceStore.error"
      variant="error"
      :message="sportInsuranceStore.error"
      dismissible
      class="mb-6"
      @dismiss="sportInsuranceStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="sportInsuranceStore.isLoading && !sportInsuranceStore.sportInsurance" />

    <!-- Content Editor -->
    <div
      v-else
      class="max-w-4xl"
    >
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">SPORTVERSICHERUNG</h2>

        <div class="mb-6">
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Inhalt (Markdown) </label>
          <VsgMarkdownEditor
            v-model="content"
            placeholder="Sportversicherungsinformationen eingeben..."
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
          :disabled="sportInsuranceStore.isSaving"
          :loading="sportInsuranceStore.isSaving"
          @click="handleSave"
        >
          {{ sportInsuranceStore.isSaving ? 'Speichern...' : 'Sportversicherung speichern' }}
        </AdminButton>
      </div>
    </div>
  </div>
</template>
