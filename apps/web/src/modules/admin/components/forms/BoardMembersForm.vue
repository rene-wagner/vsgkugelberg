<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import { VueDraggable } from 'vue-draggable-plus';
import { useBoardContentStore } from '../../stores/boardContentStore';
import { useContactPersonsStore } from '../../stores/contactPersonsStore';
import type { BoardContent, BoardMember, BoardMemberDto } from '../../types/board-content.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const props = defineProps<{
  boardContent: BoardContent;
}>();

const boardContentStore = useBoardContentStore();
const contactPersonsStore = useContactPersonsStore();

const localBoardMembers = ref<BoardMember[]>([]);
const selectedContactPersonId = ref<number | null>(null);

// Load contact persons on mount
contactPersonsStore.fetchContactPersons();

watch(
  () => props.boardContent,
  (newContent) => {
    if (newContent) {
      localBoardMembers.value = [...newContent.boardMembers];
    }
  },
  { immediate: true },
);

// Get available contact persons (not already added)
const availableContactPersons = computed(() => {
  const usedIds = new Set(localBoardMembers.value.map((bm) => bm.contactPersonId));
  return (contactPersonsStore.contactPersons || []).filter((cp) => !usedIds.has(cp.id));
});

function handleAddMember() {
  if (!selectedContactPersonId.value) return;

  const contactPerson = contactPersonsStore.contactPersons?.find((cp) => cp.id === selectedContactPersonId.value);
  if (!contactPerson) return;

  const newMember: BoardMember = {
    id: Date.now(), // Temporary ID
    contactPersonId: contactPerson.id,
    firstName: contactPerson.firstName,
    lastName: contactPerson.lastName,
    type: contactPerson.type,
    email: contactPerson.email || '',
    phone: contactPerson.phone,
    profileImage: contactPerson.profileImage
      ? {
          id: contactPerson.profileImage.id,
          filename: contactPerson.profileImage.filename,
          path: contactPerson.profileImage.path,
          thumbnails: null,
        }
      : null,
    sort: localBoardMembers.value.length,
  };

  localBoardMembers.value.push(newMember);
  selectedContactPersonId.value = null;
}

function handleRemoveMember(index: number) {
  localBoardMembers.value.splice(index, 1);
  // Update sort order
  localBoardMembers.value.forEach((member, idx) => {
    member.sort = idx;
  });
}

async function handleSubmit() {
  const boardMembersDto: BoardMemberDto[] = localBoardMembers.value.map((member, index) => ({
    contactPersonId: member.contactPersonId,
    sort: index,
  }));

  await boardContentStore.updateBoardContent({
    boardMembers: boardMembersDto,
  });
}
</script>

<template>
  <form
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div class="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
      <h2 class="font-display text-xl tracking-wider text-vsg-blue-900 mb-6">Vorstandsmitglieder</h2>

      <!-- Add Member Section -->
      <div class="mb-6">
        <label
          for="contactPerson"
          class="block font-body font-normal text-xs tracking-wider text-vsg-blue-600 uppercase mb-2"
        >
          Mitglied hinzufügen
        </label>
        <div class="flex gap-2">
          <select
            id="contactPerson"
            v-model="selectedContactPersonId"
            class="flex-1 px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-vsg-blue-900 text-sm focus:outline-none focus:border-vsg-blue-600"
          >
            <option :value="null">-- Kontaktperson auswählen --</option>
            <option
              v-for="cp in availableContactPersons"
              :key="cp.id"
              :value="cp.id"
            >
              {{ cp.firstName }} {{ cp.lastName }} ({{ cp.type }})
            </option>
          </select>
          <button
            type="button"
            class="px-6 py-2.5 bg-vsg-gold-400 text-vsg-blue-900 font-display text-sm tracking-wider rounded-lg hover:bg-vsg-gold-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!selectedContactPersonId"
            @click="handleAddMember"
          >
            <FontAwesomeIcon icon="plus" />
            Hinzufügen
          </button>
        </div>
      </div>

      <!-- Board Members List -->
      <div class="space-y-3">
        <p class="font-body text-sm text-gray-600 mb-3">Ziehen Sie die Mitglieder, um die Reihenfolge zu ändern:</p>

        <VueDraggable
          v-model="localBoardMembers"
          :animation="200"
          handle=".drag-handle"
          class="space-y-2"
        >
          <div
            v-for="(member, index) in localBoardMembers"
            :key="member.id"
            class="flex items-center gap-3 p-4 bg-gray-50 border border-gray-200 rounded-lg hover:border-vsg-blue-300 transition-colors"
          >
            <!-- Drag Handle -->
            <div class="drag-handle cursor-move text-gray-400 hover:text-vsg-blue-600">
              <FontAwesomeIcon icon="grip-vertical" />
            </div>

            <!-- Profile Image -->
            <div class="shrink-0">
              <div
                v-if="member.profileImage"
                class="w-12 h-12 rounded-full overflow-hidden bg-gray-200"
              >
                <img
                  :src="`/uploads/${member.profileImage.filename}`"
                  :alt="`${member.firstName} ${member.lastName}`"
                  class="w-full h-full object-cover"
                />
              </div>
              <div
                v-else
                class="w-12 h-12 rounded-full bg-vsg-blue-200 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon="user"
                  class="text-vsg-blue-600"
                />
              </div>
            </div>

            <!-- Member Info -->
            <div class="flex-1">
              <p class="font-display text-sm text-vsg-blue-900">{{ member.firstName }} {{ member.lastName }}</p>
              <p class="font-body text-xs text-gray-600">{{ member.type }}</p>
            </div>

            <!-- Sort Order -->
            <div class="text-sm text-gray-500 font-mono">#{{ index + 1 }}</div>

            <!-- Remove Button -->
            <button
              type="button"
              class="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              @click="handleRemoveMember(index)"
            >
              <FontAwesomeIcon icon="trash" />
            </button>
          </div>
        </VueDraggable>

        <div
          v-if="localBoardMembers.length === 0"
          class="text-center py-8 text-gray-500 font-body text-sm"
        >
          Keine Vorstandsmitglieder hinzugefügt
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class="px-8 py-2.5 bg-vsg-blue-600 text-white font-display text-sm tracking-wider rounded-lg hover:bg-vsg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="boardContentStore.isSaving"
      >
        {{ boardContentStore.isSaving ? 'Speichern...' : 'Speichern' }}
      </button>
    </div>
  </form>
</template>
