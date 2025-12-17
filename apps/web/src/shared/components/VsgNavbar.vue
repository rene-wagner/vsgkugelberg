<script setup lang="ts">
import { ref } from 'vue';
import VsgButton from './VsgButton.vue';

interface MenuItem {
  label: string;
  href: string;
}

const isMenuOpen = ref(false);
const isVereinOpen = ref(false);
const isAbteilungenOpen = ref(false);

const vereinItems: MenuItem[] = [
  { label: 'Geschichte', href: '#' },
  { label: 'Vorstand', href: '#' },
  { label: 'Satzung', href: '#' },
  { label: 'Mitgliedschaft', href: '#' },
  { label: 'Sponsoren', href: '#' },
];

const abteilungenItems: MenuItem[] = [
  { label: 'Badminton', href: '#' },
  { label: 'Gymnastik', href: '#' },
  { label: 'Tischtennis', href: '#' },
  { label: 'Volleyball', href: '#' },
];

function toggleMenu() {
  isMenuOpen.value = !isMenuOpen.value;
}

function closeMenu() {
  isMenuOpen.value = false;
  isVereinOpen.value = false;
  isAbteilungenOpen.value = false;
}

function toggleVerein() {
  isVereinOpen.value = !isVereinOpen.value;
}

function toggleAbteilungen() {
  isAbteilungenOpen.value = !isAbteilungenOpen.value;
}
</script>

<template>
  <nav
    class="fixed left-0 right-0 top-0 z-50 border-b border-vsg-gold-400/20 bg-vsg-blue-900/90 backdrop-blur-md"
  >
    <div class="mx-auto max-w-7xl px-6 py-4">
      <div class="flex items-center justify-between">
        <!-- Logo -->
        <div class="flex items-center gap-4">
          <div
            class="animate-pulse-gold flex h-12 w-12 items-center justify-center rounded-lg bg-vsg-gold-400"
          >
            <span class="font-display text-2xl tracking-tight text-vsg-blue-900"
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

        <!-- Desktop Menu -->
        <div class="hidden items-center gap-8 md:flex">
          <!-- Verein Dropdown -->
          <div class="group relative">
            <button
              class="flex items-center gap-1 font-body text-sm font-extralight uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >
              Verein
              <svg
                class="h-4 w-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              class="invisible absolute left-0 top-full mt-2 w-48 translate-y-2 transform rounded-lg border border-vsg-gold-400/20 bg-vsg-blue-900 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="py-2">
                <a
                  v-for="item in vereinItems"
                  :key="item.label"
                  :href="item.href"
                  class="block px-4 py-2 font-body text-sm font-extralight text-vsg-gold-300 transition-colors hover:bg-vsg-blue-800/50 hover:text-vsg-gold-400"
                >
                  {{ item.label }}
                </a>
              </div>
            </div>
          </div>

          <!-- Abteilungen Dropdown -->
          <div class="group relative">
            <button
              class="flex items-center gap-1 font-body text-sm font-extralight uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >
              Abteilungen
              <svg
                class="h-4 w-4 transition-transform group-hover:rotate-180"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
            <div
              class="invisible absolute left-0 top-full mt-2 w-48 translate-y-2 transform rounded-lg border border-vsg-gold-400/20 bg-vsg-blue-900 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="py-2">
                <a
                  v-for="item in abteilungenItems"
                  :key="item.label"
                  :href="item.href"
                  class="block px-4 py-2 font-body text-sm font-extralight text-vsg-gold-300 transition-colors hover:bg-vsg-blue-800/50 hover:text-vsg-gold-400"
                >
                  {{ item.label }}
                </a>
              </div>
            </div>
          </div>

          <a
            href="#"
            class="font-body text-sm font-extralight uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >Termine</a
          >
          <a
            href="#"
            class="font-body text-sm font-extralight uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >Kontakt</a
          >
          <VsgButton variant="primary" size="md">MITGLIED WERDEN</VsgButton>
        </div>

        <!-- Mobile Burger Button -->
        <button
          class="group flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          :aria-label="isMenuOpen ? 'Menu schließen' : 'Menu öffnen'"
          @click="toggleMenu"
        >
          <span
            class="h-0.5 w-6 bg-vsg-gold-400 transition-all duration-300 group-hover:bg-vsg-gold-300"
            :class="{
              'translate-y-2 rotate-45': isMenuOpen,
            }"
          />
          <span
            class="h-0.5 w-6 bg-vsg-gold-400 transition-all duration-300 group-hover:bg-vsg-gold-300"
            :class="{ 'opacity-0': isMenuOpen }"
          />
          <span
            class="h-0.5 w-6 bg-vsg-gold-400 transition-all duration-300 group-hover:bg-vsg-gold-300"
            :class="{
              '-translate-y-2 -rotate-45': isMenuOpen,
            }"
          />
        </button>
      </div>
    </div>
  </nav>

  <!-- Mobile Menu Overlay -->
  <div
    class="fixed inset-0 z-40 overflow-y-scroll bg-vsg-blue-900 transition-transform duration-300 ease-in-out md:hidden"
    :class="isMenuOpen ? 'translate-x-0' : 'translate-x-full'"
  >
    <div class="flex min-h-full flex-col items-center gap-6 px-8 pb-12 pt-28">
      <!-- Verein with submenu -->
      <div class="flex w-full max-w-xs flex-col">
        <button
          class="flex w-full items-center justify-between font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="toggleVerein"
        >
          <span>VEREIN</span>
          <svg
            class="h-6 w-6 shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': isVereinOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          class="mt-4 flex flex-col gap-3 overflow-hidden pl-4 transition-all duration-300"
          :style="{ maxHeight: isVereinOpen ? '300px' : '0' }"
        >
          <a
            v-for="item in vereinItems"
            :key="item.label"
            :href="item.href"
            class="font-body text-lg font-extralight text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
        </div>
      </div>

      <!-- Abteilungen with submenu -->
      <div class="flex w-full max-w-xs flex-col">
        <button
          class="flex w-full items-center justify-between font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="toggleAbteilungen"
        >
          <span>ABTEILUNGEN</span>
          <svg
            class="h-6 w-6 shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': isAbteilungenOpen }"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <div
          class="mt-4 flex flex-col gap-3 overflow-hidden pl-4 transition-all duration-300"
          :style="{ maxHeight: isAbteilungenOpen ? '300px' : '0' }"
        >
          <a
            v-for="item in abteilungenItems"
            :key="item.label"
            :href="item.href"
            class="font-body text-lg font-extralight text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            @click="closeMenu"
          >
            {{ item.label }}
          </a>
        </div>
      </div>

      <div class="mb-4 w-full max-w-xs">
        <a
          href="#"
          class="block font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="closeMenu"
          >TERMINE</a
        >
      </div>
      <div class="mb-4 w-full max-w-xs">
        <a
          href="#"
          class="block font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="closeMenu"
          >KONTAKT</a
        >
      </div>
      <button
        class="mt-8 bg-vsg-gold-400 px-8 py-4 font-display text-2xl tracking-wider text-vsg-blue-900"
        @click="closeMenu"
      >
        MITGLIED WERDEN
      </button>
    </div>
  </div>
</template>
