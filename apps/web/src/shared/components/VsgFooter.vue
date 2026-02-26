<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { useHistoryStore } from '@/modules/admin/stores/historyStore';
import VsgLogo from './VsgLogo.vue';

const historyStore = useHistoryStore();

const vereinLinks = [
  { label: 'Geschichte', href: '/verein/geschichte', isRouter: true },
  { label: 'Vorstand', href: '/verein/vorstand', isRouter: true },
  { label: 'Satzung', href: '/verein/satzung', isRouter: true },
  { label: 'Mitgliedschaft', href: '/verein/mitgliedschaft', isRouter: true },
];

const age = computed(() => {
  if (!historyStore.history?.foundingDate) {
    return 100; // Fallback
  }

  const foundingDate = new Date(historyStore.history.foundingDate);
  const today = new Date();
  let years = today.getFullYear() - foundingDate.getFullYear();
  const monthDiff = today.getMonth() - foundingDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < foundingDate.getDate())) {
    years--;
  }

  return years;
});

onMounted(() => {
  if (!historyStore.history) {
    historyStore.fetchHistory();
  }
});
</script>

<template>
  <footer class="border-t border-vsg-gold-400/20 bg-vsg-blue-900 py-16">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-12 md:grid-cols-4">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="mb-6">
            <VsgLogo class="h-14" />
          </div>
          <p class="max-w-md font-body font-normal leading-relaxed text-vsg-blue-300">
            Seit über {{ age }} Jahren der Sportverein für Weißenfels und Umgebung. Tradition, Gemeinschaft und sportliche Exzellenz.
          </p>
        </div>

        <!-- Links -->
        <div class="md:col-start-4 md:text-right">
          <h5 class="mb-6 font-display text-xl tracking-wider text-vsg-gold-400">Verein</h5>
          <ul class="space-y-3">
            <li
              v-for="link in vereinLinks"
              :key="link.label"
            >
              <RouterLink
                v-if="link.isRouter"
                :to="link.href"
                class="font-body font-normal text-vsg-blue-300 transition-colors hover:text-vsg-gold-400"
              >
                {{ link.label }}
              </RouterLink>
              <a
                v-else
                :href="link.href"
                class="font-body font-normal text-vsg-blue-300 transition-colors hover:text-vsg-gold-400"
              >
                {{ link.label }}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-vsg-gold-400/10 pt-8 md:flex-row">
        <span class="font-body text-sm font-normal text-vsg-blue-400"> &copy; 2024 VSG Kugelberg e.V. Alle Rechte vorbehalten. </span>
        <div class="flex gap-6">
          <RouterLink
            to="/impressum"
            class="font-body text-sm font-normal text-vsg-blue-400 transition-colors hover:text-vsg-gold-400"
            >Impressum</RouterLink
          >
          <RouterLink
            to="/datenschutz"
            class="font-body text-sm font-normal text-vsg-blue-400 transition-colors hover:text-vsg-gold-400"
            >Datenschutz</RouterLink
          >
        </div>
      </div>
    </div>
  </footer>
</template>
