<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import ResetPasswordForm from '../components/ResetPasswordForm.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const route = useRoute();

const token = computed(() => {
  const t = route.query.token;
  return typeof t === 'string' ? t : '';
});

const hasValidToken = computed(() => token.value.length === 64);
</script>

<template>
  <section class="min-h-screen flex items-center justify-center overflow-hidden">
    <div class="relative z-10 w-full max-w-md mx-auto px-6 py-12">
      <!-- Logo and Brand -->
      <div class="text-center mb-10 animate-slide-up">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-4 mb-6"
        >
          <div class="w-14 h-14 bg-vsg-gold-400 rounded-lg flex items-center justify-center animate-pulse-gold">
            <span class="font-display text-vsg-blue-900 text-3xl tracking-tight">VK</span>
          </div>
          <div class="text-left">
            <span class="font-display text-3xl tracking-wider text-white block">VSG KUGELBERG</span>
            <span class="text-xs font-body font-normal tracking-[0.3em] text-vsg-gold-400 uppercase">Weissenfels</span>
          </div>
        </RouterLink>
      </div>

      <!-- Reset Password Card -->
      <div class="bg-vsg-blue-900/80 backdrop-blur-md border border-vsg-gold-400/20 rounded-2xl p-8 animate-scale-in delay-200">
        <!-- Invalid Token State -->
        <div
          v-if="!hasValidToken"
          class="text-center"
        >
          <div class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <FontAwesomeIcon
              icon="triangle-exclamation"
              class="text-red-400"
            />
          </div>
          <h1 class="font-display text-2xl tracking-wider text-white text-glow mb-4">UNGÜLTIGER LINK</h1>
          <p class="font-body font-normal text-vsg-blue-200 mb-6">Di^eser Link ist ungültig oder abgelaufen. Bitte fordere einen neuen an.</p>
          <RouterLink
            to="/forgot-password"
            class="inline-flex items-center gap-2 font-body font-normal text-vsg-gold-400 hover:text-vsg-gold-300 transition-colors"
          >
            Neuen Link anfordern
            <FontAwesomeIcon icon="arrow-right" />
          </RouterLink>
        </div>

        <!-- Valid Token - Show Form -->
        <template v-else>
          <div class="text-center mb-8">
            <h1 class="font-display text-3xl md:text-4xl tracking-wider text-white text-glow">Neues Passwort</h1>
            <p class="font-body font-normal text-vsg-blue-200 mt-2">Gib dein neues Passwort ein.</p>
          </div>

          <ResetPasswordForm :token="token" />
        </template>
      </div>

      <!-- Back to Login -->
      <div class="text-center mt-8 animate-slide-up delay-500">
        <RouterLink
          to="/login"
          class="inline-flex items-center gap-2 font-body font-normal text-sm text-vsg-blue-300 hover:text-vsg-gold-400 transition-colors"
        >
          <FontAwesomeIcon icon="arrow-left" />
          Zurück zum Login
        </RouterLink>
      </div>
    </div>
  </section>
</template>
