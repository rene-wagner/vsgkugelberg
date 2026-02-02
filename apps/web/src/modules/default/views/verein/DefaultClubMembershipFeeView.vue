<script setup lang="ts">
import { onMounted } from 'vue';
import { useMembershipFeeStore } from '../../stores/membershipFeeStore';
import VsgMarkdownRenderer from '@/shared/components/VsgMarkdownRenderer.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const membershipFeeStore = useMembershipFeeStore();

onMounted(async () => {
  await membershipFeeStore.fetchMembershipFee();
});
</script>

<template>
  <div class="bg-white">
    <!-- Header Section -->
    <section class="bg-vsg-blue-900 pb-20 pt-40">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h1 class="font-display text-5xl tracking-wider text-white md:text-7xl">BEITRAGSORDNUNG</h1>
        <p class="mt-4 font-body text-lg text-vsg-blue-200">Mitgliedsbeiträge und Zahlungsmodalitäten</p>
      </div>
    </section>

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
