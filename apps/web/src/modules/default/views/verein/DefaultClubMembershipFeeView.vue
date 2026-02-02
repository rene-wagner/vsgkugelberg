<script setup lang="ts">
import { onMounted } from 'vue';
import { useMembershipFeeStore } from '../../stores/membershipFeeStore';
import VsgMarkdownRenderer from '@/shared/components/VsgMarkdownRenderer.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgHeroSection from '../../components/VsgHeroSection.vue';

const membershipFeeStore = useMembershipFeeStore();

onMounted(async () => {
  await membershipFeeStore.fetchMembershipFee();
});
</script>

<template>
  <div>
    <VsgHeroSection
      headline="BEITRAGSORDNUNG"
      description="Mitgliedsbeiträge und Zahlungsmodalitäten"
      min-height="70vh"
    />

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <!-- Contact Note -->
        <div class="mb-12">
          <div class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6">
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
          </div>
        </div>

        <!-- Loading State -->
        <div
          v-if="membershipFeeStore.isLoading"
          class="flex justify-center py-12"
        >
          <FontAwesomeIcon
            icon="spinner"
            spin
            class="text-4xl text-vsg-gold-400"
          />
        </div>

        <!-- Error State -->
        <div
          v-else-if="membershipFeeStore.error"
          class="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
        >
          <p class="font-body text-red-600">{{ membershipFeeStore.error }}</p>
        </div>

        <!-- No Content State -->
        <div
          v-else-if="!membershipFeeStore.membershipFee?.content"
          class="rounded-xl border border-vsg-blue-200 bg-vsg-blue-50 p-6 text-center"
        >
          <p class="font-body text-vsg-blue-600">Die Beitragsordnung wird derzeit aktualisiert.</p>
        </div>

        <!-- Membership Fee Content -->
        <div
          v-else
          class="prose prose-lg max-w-none"
        >
          <VsgMarkdownRenderer :content="membershipFeeStore.membershipFee.content" />
        </div>
      </div>
    </section>
  </div>
</template>
