<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useMembershipFeeStore } from '../stores/membershipFeeStore';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';
import AdminAlert from '../components/AdminAlert.vue';
import AdminButton from '../components/AdminButton.vue';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';

const membershipFeeStore = useMembershipFeeStore();

const content = ref('');

async function handleSave() {
  await membershipFeeStore.updateMembershipFee({ content: content.value });
}

// Watch for membership fee changes to update local content
watch(
  () => membershipFeeStore.membershipFee,
  (newMembershipFee) => {
    if (newMembershipFee) {
      content.value = newMembershipFee.content;
    }
  },
  { immediate: true },
);

onMounted(async () => {
  await membershipFeeStore.fetchMembershipFee();
});
</script>

<template>
  <div>
    <AdminPageHeader
      title="BEITRAGSORDNUNG"
      description="Verwaltung der Beitragsordnung"
    />

    <!-- Success/Error Messages -->
    <AdminAlert
      v-if="membershipFeeStore.successMessage"
      variant="success"
      :message="membershipFeeStore.successMessage"
      dismissible
      :auto-dismiss="5000"
      class="mb-6"
      @dismiss="membershipFeeStore.clearMessages"
    />

    <AdminAlert
      v-if="membershipFeeStore.error"
      variant="error"
      :message="membershipFeeStore.error"
      dismissible
      class="mb-6"
      @dismiss="membershipFeeStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="membershipFeeStore.isLoading && !membershipFeeStore.membershipFee" />

    <!-- Content Editor -->
    <div
      v-else
      class="max-w-4xl"
    >
      <div class="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
        <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">BEITRAGSORDNUNG</h2>

        <div class="mb-6">
          <label class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"> Inhalt (Markdown) </label>
          <VsgMarkdownEditor
            v-model="content"
            placeholder="Beitragsordnung eingeben..."
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
          :disabled="membershipFeeStore.isSaving"
          :loading="membershipFeeStore.isSaving"
          @click="handleSave"
        >
          {{ membershipFeeStore.isSaving ? 'Speichern...' : 'Beitragsordnung speichern' }}
        </AdminButton>
      </div>
    </div>
  </div>
</template>
