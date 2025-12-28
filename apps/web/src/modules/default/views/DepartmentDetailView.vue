<script setup lang="ts">
import { watch, onMounted, onUnmounted, watchEffect } from 'vue';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
import { RouterLink } from 'vue-router';
import VsgMarkdownRenderer from '@shared/components/VsgMarkdownRenderer.vue';
import {
  useDefaultDepartmentsStore,
  getMediaUrl,
} from '../stores/departmentsStore';

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
</script>

<template>
  <div class="bg-white">
    <!-- Loading State -->
    <div
      v-if="currentDepartmentLoading"
      class="flex min-h-[60vh] items-center justify-center"
    >
      <div
        class="h-12 w-12 animate-spin rounded-full border-4 border-vsg-blue-200 border-t-vsg-blue-600"
      ></div>
    </div>

    <!-- Error State -->
    <div
      v-else-if="currentDepartmentError"
      class="flex min-h-[60vh] flex-col items-center justify-center px-6"
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
      class="flex min-h-[60vh] flex-col items-center justify-center px-6"
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
          class="inline-block rounded-lg bg-vsg-gold-500 px-6 py-3 font-body text-sm font-medium text-vsg-blue-900 transition-colors hover:bg-vsg-gold-400"
        >
          Zur Startseite
        </RouterLink>
      </div>
    </div>

    <!-- Department Content -->
    <template v-else-if="currentDepartment">
      <!-- Header Section -->
      <section class="bg-vsg-blue-900 pb-20 pt-40">
        <div class="mx-auto max-w-4xl px-6 text-center">
          <!-- Icon -->
          <div
            v-if="currentDepartment.icon"
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-vsg-gold-400/20"
          >
            <img
              :src="getMediaUrl(currentDepartment.icon)"
              :alt="currentDepartment.name"
              class="h-12 w-12 object-contain"
              style="
                filter: brightness(0) saturate(100%) invert(100%) sepia(0%)
                  saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%);
              "
            />
          </div>
          <div
            v-else
            class="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-vsg-gold-400/20"
          >
            <svg
              class="h-12 w-12 text-white"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>

          <!-- Title -->
          <h1
            class="font-display text-5xl tracking-wider text-white md:text-7xl"
          >
            {{ currentDepartment.name.toUpperCase() }}
          </h1>
        </div>
      </section>

      <!-- Content Section -->
      <section class="py-16">
        <div class="mx-auto max-w-4xl px-6">
          <VsgMarkdownRenderer :content="currentDepartment.longDescription" />
        </div>
      </section>
    </template>
  </div>
</template>
