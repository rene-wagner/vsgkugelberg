<script setup lang="ts">
import { watch, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import { useDefaultDepartmentsStore } from '../stores/departmentsStore';
import VsgDepartmentHeroSection from '../components/VsgDepartmentHeroSection.vue';
import StatsSection from '../components/StatsSection.vue';
import VsgTrainingScheduleSection from '../components/VsgTrainingScheduleSection.vue';
import VsgLocationSection from '../components/VsgLocationSection.vue';
import VsgTrainersSection from '../components/VsgTrainersSection.vue';
import VsgDepartmentCtaSection from '../components/VsgDepartmentCtaSection.vue';
import type {
  Stat,
  TrainingGroup,
  DepartmentLocation,
  Trainer,
  DepartmentCta,
} from '../types/department-detail.types';

const route = useRoute();
const departmentsStore = useDefaultDepartmentsStore();
const {
  currentDepartment,
  currentDepartmentLoading,
  currentDepartmentError,
  currentDepartmentNotFound,
} = storeToRefs(departmentsStore);

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

// Static department data (to be replaced by API in future)
// Tischtennis department data
const tischtennisStats: Stat[] = [
  { value: '45', label: 'Aktive Spieler' },
  { value: '3', label: 'Mannschaften' },
  { value: '12', label: 'Tischtennisplatten' },
  { value: '8', label: 'Meistertitel' },
];

const tischtennisTrainingGroups: TrainingGroup[] = [
  {
    name: 'Kinder & Jugend',
    ageRange: '6 - 17 Jahre',
    icon: 'youth',
    variant: 'primary',
    sessions: [
      {
        day: 'Montag',
        time: '16:00 - 17:30',
        group: 'Anfänger',
        level: 'beginner',
      },
      {
        day: 'Mittwoch',
        time: '16:00 - 18:00',
        group: 'Fortgeschrittene',
        level: 'intermediate',
      },
      {
        day: 'Freitag',
        time: '15:30 - 17:00',
        group: 'Alle Stufen',
        level: 'all',
      },
      {
        day: 'Samstag',
        time: '10:00 - 12:00',
        group: 'Wettkampfteam',
        level: 'competition',
      },
    ],
    note: '<strong>Hinweis:</strong> Schläger und Bälle werden gestellt. Bitte Hallenschuhe und Sportkleidung mitbringen.',
  },
  {
    name: 'Erwachsene',
    ageRange: 'Ab 18 Jahre',
    icon: 'adults',
    variant: 'secondary',
    sessions: [
      {
        day: 'Dienstag',
        time: '19:00 - 21:30',
        group: 'Hobbyspieler',
        level: 'intermediate',
      },
      {
        day: 'Donnerstag',
        time: '19:00 - 22:00',
        group: 'Mannschaftstraining',
        level: 'competition',
      },
      {
        day: 'Freitag',
        time: '19:30 - 21:30',
        group: 'Freies Spiel',
        level: 'beginner',
      },
      {
        day: 'Sonntag',
        time: '10:00 - 13:00',
        group: 'Punktspiele',
        level: 'advanced',
      },
    ],
    note: '<strong>Probetraining:</strong> Jederzeit möglich! Einfach vorbeikommen oder vorher kurz per E-Mail anmelden.',
  },
];

const tischtennisLocations: DepartmentLocation[] = [
  {
    name: 'Sporthalle Kugelberg',
    badge: 'HAUPTHALLE',
    badgeVariant: 'primary',
    street: 'Kugelbergstraße 15',
    city: '06667 Weißenfels',
    amenities: [
      { icon: 'tables', text: '8 Tischtennisplatten' },
      { icon: 'check', text: 'Umkleiden & Duschen vorhanden' },
      { icon: 'check', text: 'Parkplätze direkt vor der Halle' },
    ],
    mapsUrl: 'https://maps.google.com/?q=Kugelbergstraße+15,+06667+Weißenfels',
  },
  {
    name: 'Schulsporthalle Langendorf',
    badge: 'AUSWEICHHALLE',
    badgeVariant: 'secondary',
    street: 'Schulstraße 8',
    city: '06667 Langendorf',
    amenities: [
      { icon: 'tables', text: '4 Tischtennisplatten' },
      { icon: 'check', text: 'Umkleiden vorhanden' },
      { icon: 'info', text: 'Nur für Jugendtraining (Mo & Mi)' },
    ],
    mapsUrl: 'https://maps.google.com/?q=Schulstraße+8,+06667+Langendorf',
  },
];

const tischtennisTrainers: Trainer[] = [
  {
    name: 'Michael Weber',
    role: 'Abteilungsleiter & Cheftrainer',
    licenses: [{ name: 'DTTB C-Lizenz', variant: 'gold' }],
    experience: '25 Jahre Spielerfahrung, ehemaliger Bezirksligaspieler',
    quote:
      'Tischtennis ist mehr als nur ein Sport - es ist Konzentration, Reaktion und vor allem Spaß an der Bewegung.',
    contactPersonId: 1,
  },
  {
    name: 'Sandra Müller',
    role: 'Jugendtrainerin',
    licenses: [
      { name: 'DTTB D-Lizenz', variant: 'gold' },
      { name: 'Jugendwart', variant: 'blue' },
    ],
    experience: 'Spezialisiert auf Kinder- und Jugendtraining',
    quote:
      'Bei mir lernen die Kinder spielerisch die Grundlagen und entwickeln Freude am Tischtennis.',
    contactPersonId: 2,
  },
  {
    name: 'Thomas Schmidt',
    role: 'Mannschaftstrainer',
    licenses: [{ name: 'DTTB B-Lizenz', variant: 'gold' }],
    experience: 'Aktiver Landesligaspieler mit Wettkampferfahrung',
    quote:
      'Mein Fokus liegt auf Technik und Taktik für unsere Mannschaftsspieler.',
    contactPersonId: 3,
  },
];

const tischtennisCta: DepartmentCta = {
  title: 'LUST AUF<br/>TISCHTENNIS?',
  description:
    'Komm einfach zum Probetraining vorbei! Wir freuen uns auf dich - egal ob Anfänger oder erfahrener Spieler.',
  primaryCtaLabel: 'PROBETRAINING ANFRAGEN',
  primaryCtaRoute: '/kontakt',
  secondaryCtaLabel: 'E-MAIL SCHREIBEN',
  secondaryCtaRoute: 'mailto:tischtennis@vsg-kugelberg.de',
};
</script>

<template>
  <div>
    <!-- Loading State -->
    <div
      v-if="currentDepartmentLoading"
      class="flex min-h-[60vh] items-center justify-center bg-vsg-blue-900"
    >
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-vsg-blue-200 border-t-vsg-gold-400"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="currentDepartmentError"
      class="flex min-h-[60vh] flex-col items-center justify-center bg-white px-6"
    >
      <div class="max-w-md text-center">
        <svg
          class="mx-auto mb-6 h-16 w-16 text-red-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <h1 class="mb-4 font-display text-2xl text-vsg-blue-900">
          Fehler beim Laden
        </h1>
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
        <div
          class="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-vsg-blue-100"
        >
          <span class="font-display text-4xl text-vsg-blue-600">404</span>
        </div>
        <h1 class="mb-4 font-display text-2xl text-vsg-blue-900">
          Abteilung nicht gefunden
        </h1>
        <p class="mb-6 text-vsg-blue-700">
          Die angeforderte Abteilung existiert nicht oder wurde entfernt.
        </p>
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
      <VsgDepartmentHeroSection
        :title="currentDepartment.name.toUpperCase()"
        :description="currentDepartment.shortDescription"
        subtitle="Spannende Duelle für Kinder und Erwachsene."
        primary-cta-label="TRAININGSZEITEN"
        primary-cta-anchor="#trainingszeiten"
        secondary-cta-label="UNSERE STANDORTE"
        secondary-cta-anchor="#standorte"
      >
        <template #background-icon>
          <!-- Table Tennis Icon -->
          <svg
            class="h-[500px] w-[500px]"
            viewBox="0 0 100 100"
            fill="currentColor"
          >
            <ellipse cx="35" cy="50" rx="28" ry="35" />
            <rect x="55" y="45" width="40" height="10" rx="2" />
            <circle cx="75" cy="25" r="8" />
          </svg>
        </template>
      </VsgDepartmentHeroSection>

      <!-- Stats Section -->
      <StatsSection :stats="tischtennisStats" />

      <!-- Training Schedule Section -->
      <VsgTrainingScheduleSection
        id="trainingszeiten"
        title="TRAININGSZEITEN"
        subtitle="Wann wir trainieren"
        description="Regelmäßiges Training für alle Altersgruppen. Anfänger und Fortgeschrittene sind herzlich willkommen!"
        :groups="tischtennisTrainingGroups"
      />

      <!-- Locations Section -->
      <VsgLocationSection
        id="standorte"
        title="UNSERE STANDORTE"
        subtitle="Wo wir spielen"
        description="Moderne Hallen mit professioneller Ausstattung für optimale Trainingsbedingungen."
        :locations="tischtennisLocations"
      />

      <!-- Trainers Section -->
      <VsgTrainersSection
        id="trainer"
        title="UNSERE TRAINER"
        subtitle="Wer euch trainiert"
        description="Erfahrene und lizenzierte Trainer, die mit Leidenschaft ihr Wissen weitergeben."
        :trainers="tischtennisTrainers"
      />

      <!-- CTA Section -->
      <VsgDepartmentCtaSection
        :title="tischtennisCta.title"
        :description="tischtennisCta.description"
        :primary-cta-label="tischtennisCta.primaryCtaLabel"
        :primary-cta-route="tischtennisCta.primaryCtaRoute"
        :secondary-cta-label="tischtennisCta.secondaryCtaLabel"
        :secondary-cta-route="tischtennisCta.secondaryCtaRoute"
      />
    </template>
  </div>
</template>
