<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAdminMembershipStore } from '../stores/membershipStore';
import VsgTabNav, { type TabDefinition } from '@/shared/components/VsgTabNav.vue';
import MembershipHeroForm from '../components/forms/MembershipHeroForm.vue';
import MembershipStatsForm from '../components/forms/MembershipStatsForm.vue';
import MembershipTrialForm from '../components/forms/MembershipTrialForm.vue';
import MembershipProcessForm from '../components/forms/MembershipProcessForm.vue';
import MembershipDocumentsForm from '../components/forms/MembershipDocumentsForm.vue';
import MembershipCtaForm from '../components/forms/MembershipCtaForm.vue';
import { VsgAlert } from '@/shared/components';
import AdminPageHeader from '../components/AdminPageHeader.vue';
import AdminLoadingState from '../components/AdminLoadingState.vue';

const membershipStore = useAdminMembershipStore();

const activeTab = ref('hero');

const tabs = computed<TabDefinition[]>(() => [
  { id: 'hero', label: 'Hero' },
  { id: 'mitglieder', label: 'Mitglieder' },
  { id: 'probetraining', label: 'Probetraining' },
  { id: 'aufnahme', label: 'Aufnahme' },
  { id: 'unterlagen', label: 'Unterlagen' },
  { id: 'cta', label: 'CTA' },
]);

onMounted(async () => {
  await membershipStore.fetchMembership();
});
</script>

<template>
  <div>
    <AdminPageHeader
      title="Mitgliedschaft verwalten"
      description="Pfleget die Inhalte der Mitgliedschaftsseite"
    />

    <!-- Success/Error Messages -->
    <VsgAlert
      v-if="membershipStore.successMessage"
      variant="success"
      :message="membershipStore.successMessage"
      dismissible
      class="mb-6"
      @dismiss="membershipStore.clearMessages"
    />

    <VsgAlert
      v-if="membershipStore.error"
      variant="error"
      :message="membershipStore.error"
      dismissible
      class="mb-6"
      @dismiss="membershipStore.clearMessages"
    />

    <!-- Loading State -->
    <AdminLoadingState v-if="membershipStore.isLoading && !membershipStore.membership" />

    <!-- Content with Tabs -->
    <div v-else-if="membershipStore.membership">
      <!-- Tab Navigation -->
      <VsgTabNav
        v-model:active-tab="activeTab"
        :tabs="tabs"
      />

      <!-- Tab Content -->
      <div class="max-w-4xl">
        <div v-show="activeTab === 'hero'">
          <MembershipHeroForm :membership="membershipStore.membership" />
        </div>
        <div v-show="activeTab === 'mitglieder'">
          <MembershipStatsForm :membership="membershipStore.membership" />
        </div>
        <div v-show="activeTab === 'probetraining'">
          <MembershipTrialForm :membership="membershipStore.membership" />
        </div>
        <div v-show="activeTab === 'aufnahme'">
          <MembershipProcessForm :membership="membershipStore.membership" />
        </div>
        <div v-show="activeTab === 'unterlagen'">
          <MembershipDocumentsForm :membership="membershipStore.membership" />
        </div>
        <div v-show="activeTab === 'cta'">
          <MembershipCtaForm :membership="membershipStore.membership" />
        </div>
      </div>
    </div>
  </div>
</template>
