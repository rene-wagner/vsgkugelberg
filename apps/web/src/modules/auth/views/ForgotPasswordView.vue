<script setup lang="ts">
import { RouterLink } from 'vue-router';
import ForgotPasswordForm from '../components/ForgotPasswordForm.vue';
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

      <!-- Forgot Password Card -->
      <div class="bg-vsg-blue-900/80 backdrop-blur-md border border-vsg-gold-400/20 rounded-2xl p-8 animate-scale-in delay-200">
        <div class="text-center mb-8">
          <h1 class="font-display text-3xl md:text-4xl tracking-wider text-white text-glow">PASSWORT VERGESSEN</h1>
          <p class="font-body font-normal text-vsg-blue-200 mt-2">Gib deine E-Mail-Adresse ein, um einen Link zum Zuruecksetzen zu erhalten.</p>
        </div>

        <ForgotPasswordForm />
      </div>

      <!-- Back to Login -->
      <div class="text-center mt-8 animate-slide-up delay-500">
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-2 font-body font-normal text-sm text-vsg-blue-300 hover:text-vsg-gold-400 transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          Zuruck zum Login
        </RouterLink>
      </div>
    </div>
  </section>
</template>
