<script setup lang="ts">
import { RouterLink } from 'vue-router';
import VsgNavigationMenu from './VsgNavigationMenu.vue';

const menuItems = [
  { label: 'Startseite', path: '/' },
  { label: 'Über uns', path: '/ueber-uns' },
  { label: 'Kontakt', path: '/kontakt' },
];
</script>

<template>
  <header className="bg-[#00295e] text-white shadow-lg sticky top-0 z-50">
    <div className="container mx-auto px-4">
      <div className="flex items-center justify-between h-16">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-[#ddad1e] rounded-full flex items-center justify-center">
            <span className="text-[#00295e] font-bold text-sm">SV</span>
          </div>
          <span className="font-bold text-xl">Sportverein</span>
        </RouterLink>

        <!-- Desktop Navigation -->
        <VsgNavigationMenu
          :is-desktop="true"
          :menu-items="menuItems"
        />

        <!-- Mobile Navigation -->
        <VsgNavigationMenu
          :is-desktop="false"
          :menu-items="menuItems"
        />
      </div>
    </div>
  </header>
</template>
