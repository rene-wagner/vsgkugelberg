<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useBoardContentStore } from '../stores/boardContentStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import BoardHeroForm from '../components/forms/BoardHeroForm.vue';
import BoardMembersForm from '../components/forms/BoardMembersForm.vue';
import BoardNoteForm from '../components/forms/BoardNoteForm.vue';
import { VsgAlert } from '@/shared/components';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

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
    <AdminPageHeader
      title="Vorstand verwalten"
      description="Pflege die Inhalte der Vorstandsseite"
    />

    <!-- Success/Error Messages -->
    <VsgAlert
      v-if="boardContentStore.successMessage"
      variant="success"
      :message="boardContentStore.successMessage"
      dismissible
      :auto-dismiss="5000"
      class="mb-6"
      @dismiss="boardContentStore.clearMessages"
    />

    <VsgAlert
      v-if="boardContentStore.error"
      variant="error"
      :message="boardContentStore.error"
      dismissible
      class="mb-6"
      @dismiss="boardContentStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="boardContentStore.isLoading && !boardContentStore.boardContent" />

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
