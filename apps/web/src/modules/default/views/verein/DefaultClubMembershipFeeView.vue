<script setup lang="ts">
import { onMounted } from 'vue';
import { useMembershipFeeStore } from '../../stores/membershipFeeStore';
import VsgMarkdownRenderer from '@/shared/components/VsgMarkdownRenderer.vue';
import VsgApiState from '@/shared/components/VsgApiState.vue';
import VsgHeroSection from '../../components/VsgHeroSection.vue';
import VsgContentSection from '../../components/VsgContentSection.vue';
import VsgAlert from '@/shared/components/VsgAlert.vue';

const membershipFeeStore = useMembershipFeeStore();

onMounted(async () => {
  await membershipFeeStore.fetchMembershipFee();
});
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="BEITRAGSORDNUNG"
      description="Mitgliedsbeiträge und Zahlungsmodalitäten"
      min-height="70vh"
    />

    <VsgContentSection>
      <VsgAlert variant="info">
        <p class="font-body text-lg text-vsg-blue-700">
          <strong class="text-vsg-blue-900">Fragen zur Beitragsordnung?</strong>
          Wenden Sie sich gerne an unseren Vorstand über die
          <RouterLink
            to="/kontakt"
            class="text-vsg-gold-600 underline hover:text-vsg-gold-700"
          >
            Kontaktseite </RouterLink
          >.
        </p>
      </VsgAlert>

      <VsgApiState
        :is-loading="membershipFeeStore.isLoading"
        :error="membershipFeeStore.error"
        :empty="!membershipFeeStore.membershipFee?.content"
        empty-message="Die Beitragsordnung wird derzeit aktualisiert."
      >
        <div class="prose prose-lg max-w-none">
          <VsgMarkdownRenderer :content="membershipFeeStore.membershipFee!.content" />
        </div>
      </VsgApiState>
    </VsgContentSection>
  </div>
</template>
