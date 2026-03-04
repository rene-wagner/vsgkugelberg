<script setup lang="ts">
import { ref, watch } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useAdminMembershipStore } from '../../stores/membershipStore';
import type { MembershipContent, MembershipDepartmentStat } from '../../types/membership.types';
import MembershipDepartmentStatRow from '../MembershipDepartmentStatRow.vue';
import AdminButton from '../AdminButton.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  membership: MembershipContent;
}>();

const membershipStore = useAdminMembershipStore();

const introText = ref('');
const localStats = ref<MembershipDepartmentStat[]>([]);

watch(
  () => props.membership,
  (newMembership) => {
    if (newMembership) {
      introText.value = newMembership.introText;
      localStats.value = JSON.parse(JSON.stringify(newMembership.departmentStats));
    }
  },
  { immediate: true },
);

function addItem() {
  localStats.value.push({ departmentName: '', totalCount: 0, maleCount: 0, femaleCount: 0 });
}

function updateItem(index: number, data: MembershipDepartmentStat) {
  localStats.value[index] = data;
}

function deleteItem(index: number) {
  localStats.value.splice(index, 1);
}

async function handleSubmit() {
  await membershipStore.updateMembership({
    introText: introText.value,
    departmentStats: localStats.value,
  });
}
</script>

<template>
  <form
    class="space-y-6 pb-12"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Mitglieder Bereich</h2>

      <div>
        <label
          for="introText"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Einleitungstext
        </label>
        <textarea
          id="introText"
          v-model="introText"
          rows="3"
          class="form-input-custom w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
        ></textarea>
      </div>
    </div>

    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6 uppercase">Abteilungsstatistiken</h2>

      <div class="space-y-4">
        <VueDraggable
          v-model="localStats"
          handle=".drag-handle"
          :animation="200"
          class="space-y-3"
        >
          <MembershipDepartmentStatRow
            v-for="(item, index) in localStats"
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
          Abteilung hinzufügen
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
