<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBoardContentStore } from '../stores/boardContentStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import BoardHeroForm from '../components/forms/BoardHeroForm.vue';
import BoardMembersForm from '../components/forms/BoardMembersForm.vue';
import BoardNoteForm from '../components/forms/BoardNoteForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const boardContentStore = useBoardContentStore();

const activeTab = ref('hero');

const tabs = computed<TabDefinition[]>(() => [
  { id: 'hero', label: 'Hero' },
  { id: 'members', label: 'Vorstandsmitglieder' },
  { id: 'note', label: 'Hinweis' },
]);

onMounted(async () => {
  await boardContentStore.fetchBoardContent();
});
</script>

<template>
  <div>
    <!-- Page Header -->
    <div class="mb-8">
      <div class="flex items-center gap-2 text-sm font-body font-normal text-gray-500 mb-2">
        <span class="text-vsg-blue-600">Verein</span>
      </div>
      <h1 class="font-display text-4xl tracking-wider text-vsg-blue-900">Vorstand verwalten</h1>
      <p class="font-body font-normal text-vsg-blue-600 mt-1">Pflege die Inhalte der Vorstandsseite</p>
    </div>

    <!-- Success/Error Messages -->
    <div
      v-if="boardContentStore.successMessage"
      class="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-green-600 font-body">
        {{ boardContentStore.successMessage }}
      </p>
      <button
        class="text-green-600 hover:text-green-800"
        @click="boardContentStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <div
      v-if="boardContentStore.error"
      class="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex justify-between items-center"
    >
      <p class="text-sm text-red-600 font-body">{{ boardContentStore.error }}</p>
      <button
        class="text-red-600 hover:text-red-800"
        @click="boardContentStore.clearMessages"
      >
        <FontAwesomeIcon icon="xmark" />
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="boardContentStore.isLoading && !boardContentStore.boardContent"
      class="flex items-center justify-center py-12"
    >
      <div class="text-vsg-blue-600 font-body">Laden...</div>
    </div>

    <!-- Content with Tabs -->
    <div v-else-if="boardContentStore.boardContent">
      <!-- Tab Navigation -->
      <VsgTabNav
        v-model:active-tab="activeTab"
        :tabs="tabs"
      />

      <!-- Tab Content -->
      <div class="max-w-4xl">
        <div v-show="activeTab === 'hero'">
          <BoardHeroForm :board-content="boardContentStore.boardContent" />
        </div>
        <div v-show="activeTab === 'members'">
          <BoardMembersForm :board-content="boardContentStore.boardContent" />
        </div>
        <div v-show="activeTab === 'note'">
          <BoardNoteForm :board-content="boardContentStore.boardContent" />
        </div>
      </div>
    </div>
  </div>
</template>
