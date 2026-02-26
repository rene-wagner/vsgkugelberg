<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgLogo from '@shared/components/VsgLogo.vue';
</script>

<template>
  <section class="min-h-screen flex items-center justify-center overflow-hidden">
    <div class="relative z-10 w-full max-w-md mx-auto px-6 py-12">
      <!-- Logo -->
      <div class="text-center mb-10 animate-slide-up">
        <RouterLink
          to="/"
          class="inline-flex mb-6"
        >
          <VsgLogo class="h-14" />
        </RouterLink>
      </div>

      <!-- Login Card -->
      <div class="bg-vsg-blue-900/80 backdrop-blur-md border border-vsg-gold-400/20 rounded-2xl p-8 animate-scale-in delay-200">
        <div class="text-center mb-8">
          <h1 class="font-display text-4xl md:text-5xl tracking-wider text-white text-glow">ANMELDEN</h1>
          <p class="font-body font-normal text-vsg-blue-200 mt-2">Melde dich im Mitgliederbereich an</p>
        </div>

        <LoginForm />
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-8 animate-slide-up delay-500">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 font-body font-normal text-sm text-vsg-blue-300 hover:text-vsg-gold-400 transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          Zuruck zur Startseite
        </RouterLink>
      </div>
    </div>
  </section>
</template>
