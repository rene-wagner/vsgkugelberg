<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAdminMembershipStore } from '../../stores/membershipStore';
import type { MembershipContent } from '../../types/membership.types';
import VsgMarkdownEditor from '@/shared/components/VsgMarkdownEditor.vue';
import AdminButton from '../AdminButton.vue';

const props = defineProps<{
  membership: MembershipContent;
}>();

const membershipStore = useAdminMembershipStore();

const trialPeriodHeadline = ref('');
const trialPeriodText = ref('');

watch(
  () => props.membership,
  (newMembership) => {
    if (newMembership) {
      trialPeriodHeadline.value = newMembership.trialPeriodHeadline;
      trialPeriodText.value = newMembership.trialPeriodText;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await membershipStore.updateMembership({
    trialPeriodHeadline: trialPeriodHeadline.value,
    trialPeriodText: trialPeriodText.value,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Probetraining Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="trialPeriodHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="trialPeriodHeadline"
            v-model="trialPeriodHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="trialPeriodText"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Text
          </label>
          <VsgMarkdownEditor
            id="trialPeriodText"
            v-model="trialPeriodText"
            placeholder="Informationen zum Probetraining..."
            min-height="200px"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <AdminButton
        type="submit"
        size="large"
        :disabled="membershipStore.isSaving"
        :loading="membershipStore.isSaving"
      >
        {{ membershipStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </AdminButton>
    </div>
  </form>
</template>
