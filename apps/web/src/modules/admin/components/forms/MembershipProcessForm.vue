<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useAdminMembershipStore } from '../../stores/membershipStore';
import type { MembershipContent, MembershipProcessStep } from '../../types/membership.types';
import MembershipProcessStepRow from '../MembershipProcessStepRow.vue';
import AdminButton from '../AdminButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  membership: MembershipContent;
}>();

const membershipStore = useAdminMembershipStore();

const processHeadline = ref('');
const processText = ref('');
const localSteps = ref<MembershipProcessStep[]>([]);

watch(
  () => props.membership,
  (newMembership) => {
    if (newMembership) {
      processHeadline.value = newMembership.processHeadline;
      processText.value = newMembership.processText;
      localSteps.value = JSON.parse(JSON.stringify(newMembership.processSteps));
    }
  },
  { immediate: true },
);

function addItem() {
  localSteps.value.push({ title: '', description: '' });
}

function updateItem(index: number, data: MembershipProcessStep) {
  localSteps.value[index] = data;
}

function deleteItem(index: number) {
  localSteps.value.splice(index, 1);
}

async function handleSubmit() {
  await membershipStore.updateMembership({
    processHeadline: processHeadline.value,
    processText: processText.value,
    processSteps: localSteps.value,
  });
}
</script>

<template>
  <form
    class="space-y-6 pb-12"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Aufnahme Bereich</h2>

      <div class="space-y-6">
        <div>
          <label
            for="processHeadline"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Abschnitts-Überschrift
          </label>
          <input
            id="processHeadline"
            v-model="processHeadline"
            type="text"
            required
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          />
        </div>

        <div>
          <label
            for="processText"
            class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
          >
            Einleitungstext
          </label>
          <textarea
            id="processText"
            v-model="processText"
            rows="3"
            class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          ></textarea>
        </div>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Aufnahme-Schritte</h2>

      <div class="space-y-4">
        <VueDraggable
          v-model="localSteps"
          handle=".drag-handle"
          :animation="200"
          class="space-y-3"
        >
          <MembershipProcessStepRow
            v-for="(item, index) in localSteps"
            :key="index"
            :item="item"
            @update="(data) => updateItem(index, data)"
            @delete="deleteItem(index)"
          />
        </VueDraggable>

        <button
          type="button"
          class="w-full py-3 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 hover:border-vsg-blue-400 hover:text-vsg-blue-600 transition-all font-body text-sm flex items-center justify-center gap-2"
          @click="addItem"
        >
          <FontAwesomeIcon icon="plus" />
          Schritt hinzufügen
        </button>
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
