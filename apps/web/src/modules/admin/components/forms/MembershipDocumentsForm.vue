<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useAdminMembershipStore } from '../../stores/membershipStore';
import type { MembershipContent, MembershipDocument } from '../../types/membership.types';
import MembershipDocumentRow from '../MembershipDocumentRow.vue';
import AdminButton from '../AdminButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  membership: MembershipContent;
}>();

const membershipStore = useAdminMembershipStore();

const documentsHeadline = ref('');
const localDocs = ref<MembershipDocument[]>([]);

watch(
  () => props.membership,
  (newMembership) => {
    if (newMembership) {
      documentsHeadline.value = newMembership.documentsHeadline;
      localDocs.value = JSON.parse(JSON.stringify(newMembership.documents));
    }
  },
  { immediate: true },
);

function addItem() {
  localDocs.value.push({ title: '', url: '' });
}

function updateItem(index: number, data: MembershipDocument) {
  localDocs.value[index] = data;
}

function deleteItem(index: number) {
  localDocs.value.splice(index, 1);
}

async function handleSubmit() {
  await membershipStore.updateMembership({
    documentsHeadline: documentsHeadline.value,
    documents: localDocs.value,
  });
}
</script>

<template>
  <form
    class="space-y-6 pb-12"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Unterlagen Bereich</h2>

      <div>
        <label
          for="documentsHeadline"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Abschnitts-Überschrift
        </label>
        <input
          id="documentsHeadline"
          v-model="documentsHeadline"
          type="text"
          required
          class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        />
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Dokumente</h2>

      <div class="space-y-4">
        <VueDraggable
          v-model="localDocs"
          handle=".drag-handle"
          :animation="200"
          class="space-y-3"
        >
          <MembershipDocumentRow
            v-for="(item, index) in localDocs"
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
          Dokument hinzufügen
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
