<script setup lang="ts">
import { RouterLink } from 'vue-router';

const vereinLinks = [
  { label: 'Geschichte', href: '#' },
  { label: 'Vorstand', href: '#' },
  { label: 'Satzung', href: '#' },
  { label: 'Mitgliedschaft', href: '#' },
  { label: 'Sponsoren', href: '#' },
  { label: 'Ansprechpartner', href: '/contact', isRouter: true },
];
</script>

<template>
  <footer class="border-t border-vsg-gold-400/20 bg-vsg-blue-900 py-16">
    <div class="mx-auto max-w-7xl px-6">
      <div class="grid gap-12 md:grid-cols-4">
        <!-- Brand -->
        <div class="md:col-span-2">
          <div class="mb-6 flex items-center gap-4">
            <div
              class="flex h-14 w-14 items-center justify-center rounded-lg bg-vsg-gold-400"
            >
              <span
                class="font-display text-3xl tracking-tight text-vsg-blue-900"
                >VK</span
              >
            </div>
            <div>
              <span class="font-display text-3xl tracking-wider text-white"
                >VSG KUGELBERG</span
              >
              <span
                class="block font-body text-xs font-normal uppercase tracking-[0.3em] text-vsg-gold-400"
                >Weißenfels</span
              >
            </div>
          </div>
          <p
            class="max-w-md font-body font-normal leading-relaxed text-vsg-blue-300"
          >
            Seit über 100 Jahren der Sportverein für Weißenfels und Umgebung.
            Tradition, Gemeinschaft und sportliche Exzellenz.
          </p>
        </div>

        <!-- Links -->
        <div>
          <h5
            class="mb-6 font-display text-xl tracking-wider text-vsg-gold-400"
          >
            VEREIN
          </h5>
          <ul class="space-y-3">
            <li v-for="link in vereinLinks" :key="link.label">
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

        <!-- Contact -->
        <div>
          <h5
            class="mb-6 font-display text-xl tracking-wider text-vsg-gold-400"
          >
            KONTAKT
          </h5>
          <ul class="space-y-3">
            <li class="font-body font-normal text-vsg-blue-300">
              VSG Kugelberg e.V.<br />
              Kugelbergstraße 15<br />
              06667 Weißenfels
            </li>
            <li class="font-body font-normal text-vsg-blue-300">
              <a
                href="mailto:info@vsg-kugelberg.de"
                class="transition-colors hover:text-vsg-gold-400"
                >info@vsg-kugelberg.de</a
              >
            </li>
            <li class="font-body font-normal text-vsg-blue-300">
              <a
                href="tel:+493443123456"
                class="transition-colors hover:text-vsg-gold-400"
                >+49 3443 123456</a
              >
            </li>
          </ul>
        </div>
      </div>

      <div
        class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-vsg-gold-400/10 pt-8 md:flex-row"
      >
        <span class="font-body text-sm font-normal text-vsg-blue-400">
          &copy; 2024 VSG Kugelberg e.V. Alle Rechte vorbehalten.
        </span>
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
