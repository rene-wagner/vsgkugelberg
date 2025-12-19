<script setup lang="ts">
import { RouterLink } from 'vue-router';
import LoginForm from '../components/LoginForm.vue';
</script>

<template>
  <section
    class="min-h-screen flex items-center justify-center overflow-hidden"
  >
    <div class="relative z-10 w-full max-w-md mx-auto px-6 py-12">
      <!-- Logo and Brand -->
      <div class="text-center mb-10 animate-slide-up">
        <RouterLink to="/" class="inline-flex items-center gap-4 mb-6">
          <div
            class="w-14 h-14 bg-vsg-gold-400 rounded-lg flex items-center justify-center animate-pulse-gold"
          >
            <span class="font-display text-vsg-blue-900 text-3xl tracking-tight"
              >VK</span
            >
          </div>
          <div class="text-left">
            <span class="font-display text-3xl tracking-wider text-white block"
              >VSG KUGELBERG</span
            >
            <span
              class="text-xs font-body font-normal tracking-[0.3em] text-vsg-gold-400 uppercase"
              >Weissenfels</span
            >
          </div>
        </RouterLink>
      </div>

      <!-- Login Card -->
      <div
        class="bg-vsg-blue-900/80 backdrop-blur-md border border-vsg-gold-400/20 rounded-2xl p-8 animate-scale-in delay-200"
      >
        <div class="text-center mb-8">
          <h1
            class="font-display text-4xl md:text-5xl tracking-wider text-white text-glow"
          >
            ANMELDEN
          </h1>
          <p class="font-body font-normal text-vsg-blue-200 mt-2">
            Melde dich im Mitgliederbereich an
          </p>
        </div>

        <LoginForm />
      </div>

      <!-- Back to Home -->
      <div class="text-center mt-8 animate-slide-up delay-500">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 font-body font-normal text-sm text-vsg-blue-300 hover:text-vsg-gold-400 transition-colors"
        >
          <svg
            class="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M7 16l-4-4m0 0l4-4m-4 4h18"
            />
          </svg>
          Zuruck zur Startseite
        </RouterLink>
      </div>
    </div>
  </section>
</template>
