<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink } from 'vue-router';
import { storeToRefs } from 'pinia';
import VsgButton from './VsgButton.vue';
import { useDefaultDepartmentsStore } from '@modules/default/stores/departmentsStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

interface MenuItem {
  label: string;
  to: string;
}

const isMenuOpen = ref(false);
const isVereinOpen = ref(false);
const isAbteilungenOpen = ref(false);

const departmentsStore = useDefaultDepartmentsStore();
const { departments, isLoading: departmentsLoading } =
  storeToRefs(departmentsStore);

const vereinItems: MenuItem[] = [
  { label: 'Geschichte', to: '/verein/geschichte' },
  { label: 'Vorstand', to: '/verein/vorstand' },
  { label: 'Satzung', to: '/verein/satzung' },
  { label: 'Mitgliedschaft', to: '/verein/mitgliedschaft' },
];

const abteilungenItems = computed<MenuItem[]>(() => {
  return departments.value.map((dept) => ({
    label: dept.name,
    to: `/abteilung/${dept.slug}`,
  }));
});

onMounted(() => {
  // Only fetch if we don't have departments cached
  if (departments.value.length === 0) {
    departmentsStore.fetchDepartments();
  }
});

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
        <RouterLink to="/" class="flex items-center gap-4">
          <div
            class="animate-pulse-gold flex h-12 w-12 items-center justify-center rounded-lg bg-vsg-gold-400"
          >
            <img
              src="@/assets/logo.svg"
              alt="VSG Kugelberg Logo"
              title="VSG Kugelberg Logo"
            />
          </div>
          <div>
            <span class="font-display text-3xl tracking-wider text-white"
              >VSG KUGELBERG</span
            >
            <span
              class="block font-body text-xs font-normal uppercase tracking-[0.3em] text-vsg-gold-400"
              >Weissenfels</span
            >
          </div>
        </RouterLink>

        <!-- Desktop Menu -->
        <div class="hidden items-center gap-8 md:flex">
          <!-- Verein Dropdown -->
          <div class="group relative">
            <button
              class="flex items-center gap-1 font-body text-sm font-normal uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >
              Verein
              <FontAwesomeIcon
                icon="chevron-down"
                class="transition-transform group-hover:rotate-180"
              />
            </button>
            <div
              class="invisible absolute left-0 top-full mt-2 w-48 translate-y-2 transform rounded-lg border border-vsg-gold-400/20 bg-vsg-blue-900 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="py-2">
                <RouterLink
                  v-for="item in vereinItems"
                  :key="item.label"
                  :to="item.to"
                  class="block px-4 py-2 font-body text-sm font-normal text-vsg-gold-300 transition-colors hover:bg-vsg-blue-800/50 hover:text-vsg-gold-400"
                >
                  {{ item.label }}
                </RouterLink>
              </div>
            </div>
          </div>

          <!-- Abteilungen Dropdown -->
          <div class="group relative">
            <button
              class="flex items-center gap-1 font-body text-sm font-normal uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >
              Abteilungen
              <FontAwesomeIcon
                icon="chevron-down"
                class="transition-transform group-hover:rotate-180"
              />
            </button>
            <div
              class="invisible absolute left-0 top-full mt-2 w-48 translate-y-2 transform rounded-lg border border-vsg-gold-400/20 bg-vsg-blue-900 opacity-0 shadow-xl transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"
            >
              <div class="py-2">
                <!-- Loading state -->
                <div
                  v-if="departmentsLoading"
                  class="px-4 py-2 text-sm text-vsg-gold-300/60"
                >
                  Laden...
                </div>
                <!-- Empty state -->
                <div
                  v-else-if="abteilungenItems.length === 0"
                  class="px-4 py-2 text-sm text-vsg-gold-300/60"
                >
                  Keine Abteilungen
                </div>
                <!-- Department links -->
                <RouterLink
                  v-for="item in abteilungenItems"
                  v-else
                  :key="item.to"
                  :to="item.to"
                  class="block px-4 py-2 font-body text-sm font-normal text-vsg-gold-300 transition-colors hover:bg-vsg-blue-800/50 hover:text-vsg-gold-400"
                >
                  {{ item.label }}
                </RouterLink>
              </div>
            </div>
          </div>

          <a
            href="#"
            class="font-body text-sm font-normal uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >Termine</a
          >
          <RouterLink
            to="/kontakt"
            class="font-body text-sm font-normal uppercase tracking-wider text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            >Kontakt</RouterLink
          >
          <VsgButton variant="primary" size="md">Mitglied werden</VsgButton>
        </div>

        <!-- Mobile Burger Button -->
        <button
          class="group flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
          :aria-label="isMenuOpen ? 'Menü schließen' : 'Menü öffnen'"
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
          <span>Verein</span>
          <FontAwesomeIcon
            icon="chevron-down"
            class="shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': isVereinOpen }"
          />
        </button>
        <div
          class="mt-4 flex flex-col gap-3 overflow-hidden pl-4 transition-all duration-300"
          :style="{ maxHeight: isVereinOpen ? '300px' : '0' }"
        >
          <RouterLink
            v-for="item in vereinItems"
            :key="item.label"
            :to="item.to"
            class="font-body text-lg font-normal text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <!-- Abteilungen with submenu -->
      <div class="flex w-full max-w-xs flex-col">
        <button
          class="flex w-full items-center justify-between font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="toggleAbteilungen"
        >
          <span>Abteilungen</span>
          <FontAwesomeIcon
            icon="chevron-down"
            class="shrink-0 transition-transform duration-300"
            :class="{ 'rotate-180': isAbteilungenOpen }"
          />
        </button>
        <div
          class="mt-4 flex flex-col gap-3 overflow-hidden pl-4 transition-all duration-300"
          :style="{ maxHeight: isAbteilungenOpen ? '300px' : '0' }"
        >
          <!-- Loading state -->
          <span v-if="departmentsLoading" class="text-lg text-vsg-gold-300/60">
            Laden...
          </span>
          <!-- Empty state -->
          <span
            v-else-if="abteilungenItems.length === 0"
            class="text-lg text-vsg-gold-300/60"
          >
            Keine Abteilungen
          </span>
          <!-- Department links -->
          <RouterLink
            v-for="item in abteilungenItems"
            v-else
            :key="item.to"
            :to="item.to"
            class="font-body text-lg font-normal text-vsg-gold-300 transition-colors hover:text-vsg-gold-400"
            @click="closeMenu"
          >
            {{ item.label }}
          </RouterLink>
        </div>
      </div>

      <div class="mb-4 w-full max-w-xs">
        <a
          href="#"
          class="block font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="closeMenu"
          >Termine</a
        >
      </div>
      <div class="mb-4 w-full max-w-xs">
        <RouterLink
          to="/kontakt"
          class="block font-display text-4xl tracking-wider text-white transition-colors hover:text-vsg-gold-400"
          @click="closeMenu"
          >Kontakt</RouterLink
        >
      </div>
      <button
        class="mt-8 bg-vsg-gold-400 px-8 py-4 font-display text-2xl tracking-wider text-vsg-blue-900"
        @click="closeMenu"
      >
        Mitglied werden
      </button>
    </div>
  </div>
</template>
