<script setup lang="ts">
import { watch, onMounted, onUnmounted, watchEffect, computed } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useDefaultDepartmentsStore, getMediaUrl } from '../stores/departmentsStore';
import VsgHeroSection from '../components/VsgHeroSection.vue';
import StatsSection from '../components/StatsSection.vue';
import VsgTrainingScheduleSection from '../components/VsgTrainingScheduleSection.vue';
import VsgLocationSection from '../components/VsgLocationSection.vue';
import VsgTrainersSection from '../components/VsgTrainersSection.vue';
import VsgDepartmentCtaSection from '../components/VsgDepartmentCtaSection.vue';
import type { Stat, TrainingGroup, DepartmentLocation, Trainer, DepartmentCta } from '../types/department-detail.types';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();
const departmentsStore = useDefaultDepartmentsStore();
const { currentDepartment, currentDepartmentLoading, currentDepartmentError, currentDepartmentNotFound } = storeToRefs(departmentsStore);

function fetchDepartment() {
  const slug = route.params.slug as string;
  if (slug) {
    departmentsStore.fetchDepartmentBySlug(slug);
  }
}

// Fetch on mount
onMounted(() => {
  fetchDepartment();
});

// Watch for route param changes
watch(
  () => route.params.slug,
  () => {
    fetchDepartment();
  },
);

// Set dynamic page title
watchEffect(() => {
  if (currentDepartment.value) {
    document.title = `${currentDepartment.value.name} | VSG Kugelberg`;
  } else if (currentDepartmentNotFound.value) {
    document.title = 'Abteilung nicht gefunden | VSG Kugelberg';
  } else {
    document.title = 'Abteilung | VSG Kugelberg';
  }
});

// Clear state on unmount
onUnmounted(() => {
  departmentsStore.clearCurrentDepartment();
});

// Transform API stats to component format
const departmentStats = computed<Stat[]>(() => {
  if (!currentDepartment.value?.stats) return [];
  return currentDepartment.value.stats.map((stat) => ({
    value: stat.value,
    label: stat.label,
  }));
});

// Transform API training groups to component format
const departmentTrainingGroups = computed<TrainingGroup[]>(() => {
  if (!currentDepartment.value?.trainingGroups) return [];
  return currentDepartment.value.trainingGroups.map((group) => ({
    name: group.name,
    ageRange: group.ageRange || '',
    icon: group.icon as 'youth' | 'adults',
    variant: group.variant as 'primary' | 'secondary',
    sessions: group.sessions.map((session) => ({
      day: session.day,
      time: session.time,
      group: 'Allgemein',
      level: 'all' as const,
      locationName: session.location?.name,
    })),
  }));
});

// Transform API locations to component format
const departmentLocations = computed<DepartmentLocation[]>(() => {
  if (!currentDepartment.value?.locations) return [];
  return currentDepartment.value.locations.map((location) => ({
    id: location.id,
    name: location.name,
    badge: location.badge,
    badgeVariant: location.badgeVariant as 'primary' | 'secondary',
    street: location.street,
    city: location.city,
    amenities: Array.isArray(location.amenities) ? location.amenities : [],
    mapsUrl: location.mapsUrl || '',
    image: location.image
      ? {
          filename: location.image.filename,
          originalName: location.image.originalName,
        }
      : null,
  }));
});

// Transform API trainers to component format
const departmentTrainers = computed<Trainer[]>(() => {
  if (!currentDepartment.value?.trainers) return [];
  return currentDepartment.value.trainers.map((trainer) => {
    const licenses = Array.isArray(trainer.licenses) ? trainer.licenses : JSON.parse(trainer.licenses || '[]');

    return {
      name: `${trainer.contactPerson.firstName} ${trainer.contactPerson.lastName}`,
      role: trainer.role,
      licenses: licenses.map((lic: any) => ({
        name: lic.name,
        variant: lic.variant as 'gold' | 'blue',
      })),
      contactPersonId: trainer.contactPersonId,
      avatarUrl: trainer.contactPerson.profileImage
        ? `${import.meta.env.VITE_API_BASE_URL}/uploads/${trainer.contactPerson.profileImage.filename}`
        : undefined,
    };
  });
});

// Generate CTA based on department name
const departmentCta = computed<DepartmentCta>(() => {
  const departmentName = currentDepartment.value?.name || '';
  return {
    title: `LUST AUF<br/>${departmentName.toUpperCase()}?`,
    description: 'Komm einfach zum Probetraining vorbei! Wir freuen uns auf dich - egal ob Anfänger oder erfahrener Sportfreund.',
    primaryCtaLabel: 'PROBETRAINING ANFRAGEN',
    primaryCtaRoute: '/kontakt',
    secondaryCtaLabel: 'E-MAIL SCHREIBEN',
    secondaryCtaRoute: `mailto:${departmentName.toLowerCase().replace(/\s+/g, '-')}@vsg-kugelberg.de`,
  };
});
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <!-- Loading State -->
    <div
      v-if="currentDepartmentLoading"
      class="flex min-h-[60vh] items-center justify-center bg-vsg-blue-900"
    >
      <div class="h-12 w-12 animate-spin rounded-full border-4 border-vsg-blue-200 border-t-vsg-gold-400"></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="currentDepartmentError"
      class="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6"
    >
      <div class="max-w-md text-center">
        <FontAwesomeIcon
          icon="triangle-exclamation"
          class="mx-auto mb-6 text-red-400"
        />
        <h1 class="mb-4 font-display text-2xl text-vsg-blue-900">Fehler beim Laden</h1>
        <p class="mb-6 text-vsg-blue-700">{{ currentDepartmentError }}</p>
        <button
          class="rounded-lg bg-vsg-blue-600 px-6 py-3 font-body text-sm font-medium text-white transition-colors hover:bg-vsg-blue-700"
          @click="fetchDepartment"
        >
          Erneut versuchen
        </button>
      </div>
    </div>

    <!-- Not Found State -->
    <div
      v-else-if="currentDepartmentNotFound"
      class="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6"
    >
      <div class="max-w-md text-center">
        <div class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-vsg-blue-100">
          <span class="font-display text-4xl text-vsg-blue-600">404</span>
        </div>
        <h1 class="mb-4 font-display text-2xl text-vsg-blue-900">Abteilung nicht gefunden</h1>
        <p class="mb-6 text-vsg-blue-700">Die angeforderte Abteilung existiert nicht oder wurde entfernt.</p>
        <RouterLink
          to="/"
          class="inline-block rounded-lg bg-vsg-gold-400 px-6 py-3 font-body text-sm font-medium text-vsg-blue-900 transition-colors hover:bg-vsg-gold-300"
        >
          Zur Startseite
        </RouterLink>
      </div>
    </div>

    <!-- Department Content -->
    <template v-else-if="currentDepartment">
      <!-- Hero Section -->
      <VsgHeroSection
        :headline="currentDepartment.name.toUpperCase()"
        :description="currentDepartment.shortDescription"
        :icon-url="currentDepartment.icon ? getMediaUrl(currentDepartment.icon) : undefined"
        :primary-cta-label="departmentTrainingGroups.length > 0 ? 'TRAININGSZEITEN' : undefined"
        :primary-cta-anchor="departmentTrainingGroups.length > 0 ? '#trainingszeiten' : undefined"
        :secondary-cta-label="departmentLocations.length > 0 ? 'UNSERE STANDORTE' : undefined"
        :secondary-cta-anchor="departmentLocations.length > 0 ? '#standorte' : undefined"
        min-height="70vh"
      />

      <!-- Stats Section -->
      <StatsSection
        v-if="departmentStats.length > 0"
        :stats="departmentStats"
      />

      <!-- Training Schedule Section -->
      <VsgTrainingScheduleSection
        v-if="departmentTrainingGroups.length > 0"
        id="trainingszeiten"
        title="TRAININGSZEITEN"
        subtitle="Wann wir trainieren"
        description="Regelmäßiges Training für alle Altersgruppen. Anfänger und Fortgeschrittene sind herzlich willkommen!"
        :groups="departmentTrainingGroups"
      />

      <!-- Locations Section -->
      <VsgLocationSection
        v-if="departmentLocations.length > 0"
        id="standorte"
        title="UNSERE STANDORTE"
        subtitle="Wo wir spielen"
        description="Moderne Hallen mit professioneller Ausstattung für optimale Trainingsbedingungen."
        :locations="departmentLocations"
      />

      <!-- Trainers Section -->
      <VsgTrainersSection
        v-if="departmentTrainers.length > 0"
        id="trainer"
        title="UNSERE TRAINER"
        subtitle="Wer euch trainiert"
        description="Erfahrene und lizenzierte Trainer, die mit Leidenschaft ihr Wissen weitergeben."
        :trainers="departmentTrainers"
      />

      <!-- CTA Section -->
      <VsgDepartmentCtaSection
        :title="departmentCta.title"
        :description="departmentCta.description"
        :primary-cta-label="departmentCta.primaryCtaLabel"
        :primary-cta-route="departmentCta.primaryCtaRoute"
        :secondary-cta-label="departmentCta.secondaryCtaLabel"
        :secondary-cta-route="departmentCta.secondaryCtaRoute"
      />
    </template>
  </div>
</template>
