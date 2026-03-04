<script setup lang="ts">
import { onMounted } from 'vue';
import { VsgMarkdownRenderer, VsgApiState } from '@/shared/components';
import CtaSection from '../../components/CtaSection.vue';
import { useMembershipStore } from '../../stores/membershipStore';
import VsgHeroSection from '../../components/VsgHeroSection.vue';

const membershipStore = useMembershipStore();

onMounted(async () => {
  await membershipStore.fetchMembership();
});
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgApiState
      :is-loading="membershipStore.isLoading"
      :error="membershipStore.error"
      :empty="!membershipStore.membership"
      empty-message="Die Mitgliedschaftsinformationen werden derzeit aktualisiert."
    >
      <!-- Hero Section -->
      <VsgHeroSection
        :headline="membershipStore.membership!.heroHeadline"
        :description="membershipStore.membership!.heroSubHeadline"
        tag="Mitglied werden"
        min-height="70vh"
      />

      <!-- Section: Department Stats (White Background) -->
      <section
        v-if="membershipStore.membership!.departmentStats.length > 0"
        class="py-24 bg-white"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="h-px w-12 bg-vsg-gold-600"></div>
              <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase">Unsere Abteilungen</span>
              <div class="h-px w-12 bg-vsg-gold-600"></div>
            </div>
            <div
              v-if="membershipStore.membership!.introText"
              class="font-body text-vsg-blue-700 max-w-2xl mx-auto text-lg"
            >
              <VsgMarkdownRenderer :content="membershipStore.membership!.introText" />
            </div>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="stat in membershipStore.membership!.departmentStats"
              :key="stat.departmentName"
              class="bg-gray-50 border border-gray-200 p-8 rounded-xl shadow-sm"
            >
              <h3 class="font-display text-xl text-vsg-blue-900 tracking-widest uppercase mb-6">
                {{ stat.departmentName }}
              </h3>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="font-body text-sm text-vsg-blue-600 uppercase tracking-wider">Gesamt</span>
                  <span class="font-display text-2xl text-vsg-blue-900">{{ stat.totalCount }}</span>
                </div>
                <div class="h-px bg-gray-200"></div>
                <div class="flex justify-between items-center">
                  <span class="font-body text-sm text-vsg-blue-600 uppercase tracking-wider">Männer</span>
                  <span class="font-display text-lg text-vsg-blue-700">{{ stat.maleCount }}</span>
                </div>
                <div class="flex justify-between items-center">
                  <span class="font-body text-sm text-vsg-blue-600 uppercase tracking-wider">Frauen</span>
                  <span class="font-display text-lg text-vsg-blue-700">{{ stat.femaleCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Trial Period (Light Gray Background) -->
      <section class="py-24 bg-gray-50">
        <div class="max-w-7xl mx-auto px-6">
          <div class="max-w-4xl mx-auto">
            <div class="flex items-center gap-4 mb-6">
              <div class="h-px w-12 bg-vsg-gold-600"></div>
              <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase">Probetraining</span>
            </div>
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 uppercase mb-8">
              {{ membershipStore.membership!.trialPeriodHeadline }}
            </h2>
            <div class="font-body text-vsg-blue-700 text-lg leading-relaxed">
              <VsgMarkdownRenderer :content="membershipStore.membership!.trialPeriodText" />
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Sign-Up Process (White Background) -->
      <section
        v-if="membershipStore.membership!.processSteps.length > 0"
        class="py-24 bg-white"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="h-px w-12 bg-vsg-gold-600"></div>
              <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase">Aufnahme</span>
              <div class="h-px w-12 bg-vsg-gold-600"></div>
            </div>
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 uppercase mb-4">
              {{ membershipStore.membership!.processHeadline }}
            </h2>
            <div
              v-if="membershipStore.membership!.processText"
              class="font-body text-vsg-blue-700 max-w-2xl mx-auto text-lg"
            >
              <VsgMarkdownRenderer :content="membershipStore.membership!.processText" />
            </div>
          </div>

          <div class="max-w-3xl mx-auto space-y-8">
            <div
              v-for="(step, index) in membershipStore.membership!.processSteps"
              :key="step.title"
              class="flex gap-6 items-start"
            >
              <div
                class="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-full bg-vsg-gold-400 font-display text-xl text-vsg-blue-900"
              >
                {{ index + 1 }}
              </div>
              <div>
                <h3 class="font-display text-xl tracking-wider text-vsg-blue-900 uppercase">{{ step.title }}</h3>
                <p class="mt-2 font-body text-vsg-blue-700 leading-relaxed">{{ step.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Documents (Light Gray Background) -->
      <section
        v-if="membershipStore.membership!.documents.length > 0"
        class="py-24 bg-gray-50"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <div class="flex items-center justify-center gap-4 mb-4">
              <div class="h-px w-12 bg-vsg-gold-600"></div>
              <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase">Unterlagen</span>
              <div class="h-px w-12 bg-vsg-gold-600"></div>
            </div>
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 uppercase">
              {{ membershipStore.membership!.documentsHeadline }}
            </h2>
          </div>

          <div class="max-w-3xl mx-auto grid sm:grid-cols-2 gap-6">
            <a
              v-for="doc in membershipStore.membership!.documents"
              :key="doc.title"
              :href="doc.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-4 bg-white border border-gray-200 p-6 rounded-xl shadow-sm hover:border-vsg-gold-400 hover:shadow-md transition-all group"
            >
              <div
                class="flex-shrink-0 flex h-12 w-12 items-center justify-center rounded-lg bg-vsg-blue-900 group-hover:bg-vsg-gold-400 transition-colors"
              >
                <svg
                  class="w-6 h-6 text-white group-hover:text-vsg-blue-900 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span class="font-display text-sm tracking-wider text-vsg-blue-900 uppercase">{{ doc.title }}</span>
            </a>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <CtaSection
        :title="membershipStore.membership!.ctaHeadline"
        :description="membershipStore.membership!.ctaDescription"
        primary-button-text="KONTAKT AUFNEHMEN"
        primary-button-link="/kontakt"
        theme="gold"
      />
    </VsgApiState>
  </div>
</template>
