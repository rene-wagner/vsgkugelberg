<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAdminMembershipStore } from '../../stores/membershipStore';
import type { MembershipContent } from '../../types/membership.types';

const props = defineProps<{
  membership: MembershipContent;
}>();

const membershipStore = useAdminMembershipStore();

const heroHeadline = ref('');
const heroSubHeadline = ref('');

watch(
  () => props.membership,
  (newMembership) => {
    if (newMembership) {
      heroHeadline.value = newMembership.heroHeadline;
      heroSubHeadline.value = newMembership.heroSubHeadline;
    }
  },
  { immediate: true },
);

async function handleSubmit() {
  await membershipStore.updateMembership({
    heroHeadline: heroHeadline.value,
    heroSubHeadline: heroSubHeadline.value,
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
            for="heroHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Überschrift
          </label>
          <input
            id="heroHeadline"
            v-model="heroHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="heroSubHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Unterüberschrift
          </label>
          <input
            id="heroSubHeadline"
            v-model="heroSubHeadline"
            type="text"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="membershipStore.isSaving"
      >
        {{ membershipStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>
