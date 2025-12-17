<script setup lang="ts">
import VsgIconButton from './VsgIconButton.vue';

const vereinLinks = [
  { label: 'Geschichte', href: '#' },
  { label: 'Vorstand', href: '#' },
  { label: 'Satzung', href: '#' },
  { label: 'Mitgliedschaft', href: '#' },
  { label: 'Sponsoren', href: '#' },
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
                class="block font-body text-xs font-extralight uppercase tracking-[0.3em] text-vsg-gold-400"
                >Weißenfels</span
              >
            </div>
          </div>
          <p
            class="max-w-md font-body font-extralight leading-relaxed text-vsg-blue-300"
          >
            Seit über 100 Jahren der Sportverein für Weißenfels und Umgebung.
            Tradition, Gemeinschaft und sportliche Exzellenz.
          </p>
          <div class="mt-6 flex gap-4">
            <VsgIconButton href="#" aria-label="Twitter">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"
                />
              </svg>
            </VsgIconButton>
            <VsgIconButton href="#" aria-label="Facebook">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"
                />
              </svg>
            </VsgIconButton>
            <VsgIconButton href="#" aria-label="Instagram">
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
                />
              </svg>
            </VsgIconButton>
          </div>
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
              <a
                :href="link.href"
                class="font-body font-extralight text-vsg-blue-300 transition-colors hover:text-vsg-gold-400"
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
            <li class="font-body font-extralight text-vsg-blue-300">
              VSG Kugelberg e.V.<br />
              Kugelbergstraße 15<br />
              06667 Weißenfels
            </li>
            <li class="font-body font-extralight text-vsg-blue-300">
              <a
                href="mailto:info@vsg-kugelberg.de"
                class="transition-colors hover:text-vsg-gold-400"
                >info@vsg-kugelberg.de</a
              >
            </li>
            <li class="font-body font-extralight text-vsg-blue-300">
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
        <span class="font-body text-sm font-extralight text-vsg-blue-400">
          &copy; 2024 VSG Kugelberg e.V. Alle Rechte vorbehalten.
        </span>
        <div class="flex gap-6">
          <a
            href="#"
            class="font-body text-sm font-extralight text-vsg-blue-400 transition-colors hover:text-vsg-gold-400"
            >Impressum</a
          >
          <a
            href="#"
            class="font-body text-sm font-extralight text-vsg-blue-400 transition-colors hover:text-vsg-gold-400"
            >Datenschutz</a
          >
        </div>
      </div>
    </div>
  </footer>
</template>
