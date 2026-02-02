<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { VsgFactCard, VsgTimeline, VsgChart, VsgAccordion, VsgSuccessList, VsgMarkdownRenderer, VsgApiState } from '@/shared/components';
import CtaSection from '../../components/CtaSection.vue';
import { useHistoryStore } from '../../stores/historyStore';
import VsgHeroSection from '../../components/VsgHeroSection.vue';

const historyStore = useHistoryStore();

const membershipChartData = computed(() => {
  if (!historyStore.history?.developmentChartData) return null;

  const raw = historyStore.history.developmentChartData;
  return {
    labels: raw.labels,
    datasets: raw.datasets.map((ds) => ({
      label: ds.label,
      data: ds.data,
      borderColor: '#d4a91a',
      backgroundColor: 'rgba(212, 169, 26, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#d4a91a',
      pointBorderColor: '#ffffff',
      pointRadius: 6,
      pointHoverRadius: 8,
    })),
  };
});

const chronicleGroups = computed(() => {
  if (!historyStore.history?.developmentChronicleGroups) return [];
  return historyStore.history.developmentChronicleGroups.map((g) => ({
    id: g.id || 0,
    title: g.headline,
    content: g.content.map((e) => ({
      year: e.year,
      text: e.description,
    })),
  }));
});

const achievementCategories = [
  { id: 'Alle', label: 'ALLE' },
  { id: 'badminton', label: 'BADMINTON' },
  { id: 'table-tennis', label: 'TISCHTENNIS' },
  { id: 'volleyball', label: 'VOLLEYBALL' },
];

const achievementItems = computed(() => {
  if (!historyStore.history?.achievementsItems) return [];
  return historyStore.history.achievementsItems.map((a) => {
    const cat = achievementCategories.find((c) => c.id === a.category);
    return {
      year: a.year,
      category: a.category,
      categoryLabel: cat ? cat.label.charAt(0) + cat.label.slice(1).toLowerCase() : 'Allgemein',
      title: a.headline,
      description: a.description,
      colorClass: a.category === 'badminton' ? 'border-vsg-gold-500' : a.category === 'table-tennis' ? 'border-vsg-blue-400' : 'border-vsg-blue-600',
    };
  });
});

onMounted(async () => {
  await historyStore.fetchHistory();
});
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgApiState
      :is-loading="historyStore.isLoading"
      :error="historyStore.error"
      :empty="!historyStore.history"
      empty-message="Die Vereinsgeschichte wird derzeit aktualisiert."
    >
      <!-- Hero Section -->
      <VsgHeroSection
        :headline="historyStore.history!.heroHeadline"
        :description="historyStore.history!.heroSubHeadline"
        tag="Tradition seit 1985"
        min-height="70vh"
      />

      <!-- Section: Founding (White Background) -->
      <section
        id="founding"
        class="py-24 bg-white"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="grid lg:grid-cols-2 gap-16 items-start">
            <!-- Narrative Text -->
            <div class="space-y-8 animate-fadeIn">
              <div class="flex items-center gap-4">
                <div class="h-px w-12 bg-vsg-gold-600"></div>
                <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase">Der Ursprung</span>
              </div>
              <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 uppercase">
                {{ historyStore.history!.foundingHeadline }}
              </h2>
              <div class="font-body text-vsg-blue-700 text-lg leading-relaxed">
                <VsgMarkdownRenderer :content="historyStore.history!.foundingDescription" />
              </div>

              <VsgFactCard
                :title="historyStore.history!.foundingFactCardHeadline"
                :facts="
                  historyStore.history!.foundingFacts.map((f) => ({
                    label: f.headline,
                    value: f.year + ': ' + f.description,
                  }))
                "
              />
            </div>

            <!-- Timeline -->
            <VsgTimeline
              :title="historyStore.history!.foundingMilestonesHeadline"
              :items="
                historyStore.history!.foundingMilestones.map((m) => ({
                  year: m.year,
                  title: m.headline,
                  description: m.description,
                }))
              "
            />
          </div>
        </div>
      </section>

      <!-- Section: Development (Chart & Chronicle) (Light Gray Background) -->
      <section
        id="development"
        class="py-24 bg-gray-50"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 mb-4 uppercase">
              {{ historyStore.history!.developmentHeadline }}
            </h2>
            <div class="font-body text-vsg-blue-700 max-w-2xl mx-auto text-lg">
              <VsgMarkdownRenderer :content="historyStore.history!.developmentDescription" />
            </div>
          </div>

          <!-- Chart -->
          <div
            v-if="membershipChartData"
            class="bg-white p-8 rounded-xl border border-gray-200 mb-20 shadow-sm"
          >
            <div class="flex justify-between items-center mb-8">
              <h3 class="font-display text-2xl text-vsg-gold-600 uppercase tracking-widest">Mitgliederstatistik</h3>
              <div class="flex items-center gap-4 text-xs uppercase tracking-tighter text-vsg-blue-600">
                <span class="flex items-center gap-1"
                  ><div class="w-3 h-3 bg-vsg-gold-500 rounded-full"></div>
                  Mitgliederzahl</span
                >
              </div>
            </div>
            <div class="h-100 w-full">
              <VsgChart :data="membershipChartData" />
            </div>
          </div>

          <!-- Chronicle Accordion -->
          <div
            v-if="chronicleGroups.length > 0"
            class="max-w-4xl mx-auto space-y-4"
          >
            <h3 class="font-display text-3xl text-vsg-blue-900 mb-8 text-center uppercase tracking-widest">Chronik der Ereignisse</h3>
            <VsgAccordion :items="chronicleGroups" />
          </div>
        </div>
      </section>

      <!-- Section: Festivals (White Background) -->
      <section
        id="festivals"
        class="py-24 bg-white"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <span class="font-display text-vsg-gold-600 text-2xl tracking-[0.2em] uppercase">Vereinsleben</span>
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 mt-2 uppercase">
              {{ historyStore.history!.festivalsHeadline }}
            </h2>
            <p class="font-body text-vsg-blue-700 mt-4 max-w-2xl mx-auto text-lg">
              {{ historyStore.history!.festivalsDescription }}
            </p>
          </div>

          <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div
              v-for="item in historyStore.history!.festivalsItems"
              :key="item.headline"
              class="bg-gray-50 border border-gray-200 p-8 hover:bg-gray-100 transition-all group overflow-hidden relative shadow-sm"
            >
              <h4 class="font-display text-2xl text-vsg-blue-900 tracking-widest uppercase">
                {{ item.headline }}
              </h4>
              <p class="font-body text-base text-vsg-blue-700 mt-4 leading-relaxed">
                {{ item.text }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- Section: Achievements (Hall of Fame) (Light Gray Background) -->
      <section
        id="achievements"
        class="py-24 bg-gray-50"
      >
        <div class="max-w-7xl mx-auto px-6">
          <div class="text-center mb-16">
            <span class="font-display text-vsg-gold-600 text-2xl tracking-[0.2em] uppercase">Unser Stolz</span>
            <h2 class="font-display text-5xl md:text-7xl text-vsg-blue-900 mt-2 uppercase">
              {{ historyStore.history!.achievementsHeadline }}
            </h2>
          </div>

          <VsgSuccessList
            :items="achievementItems"
            :categories="achievementCategories"
          />
        </div>
      </section>

      <!-- CTA Section -->
      <CtaSection
        :title="historyStore.history!.ctaHeadline"
        :description="historyStore.history!.ctaDescription"
        primary-button-text="MITGLIED WERDEN"
        primary-button-link="/verein/mitgliedschaft"
        theme="gold"
      />
    </VsgApiState>
  </div>
</template>

<style scoped>
.text-glow {
  text-shadow: 0 0 30px rgba(252, 211, 77, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes pulse-gold {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(252, 211, 77, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(252, 211, 77, 0.8);
  }
}

.animate-pulse-gold {
  animation: pulse-gold 2s ease-in-out infinite;
}
</style>
