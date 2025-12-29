<script setup lang="ts">
import { computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import ResetPasswordForm from '../components/ResetPasswordForm.vue';

const route = useRoute();

const token = computed(() => {
  const t = route.query.token;
  return typeof t === 'string' ? t : '';
});

const hasValidToken = computed(() => token.value.length === 64);
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

      <!-- Reset Password Card -->
      <div
        class="bg-vsg-blue-900/80 backdrop-blur-md border border-vsg-gold-400/20 rounded-2xl p-8 animate-scale-in delay-200"
      >
        <!-- Invalid Token State -->
        <div v-if="!hasValidToken" class="text-center">
          <div
            class="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center"
          >
            <svg
              class="w-8 h-8 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h1
            class="font-display text-2xl tracking-wider text-white text-glow mb-4"
          >
            UNGUELTIGER LINK
          </h1>
          <p class="font-body font-normal text-vsg-blue-200 mb-6">
            Dieser Link ist ungueltig oder abgelaufen. Bitte fordere einen neuen
            an.
          </p>
          <RouterLink
            to="/forgot-password"
            class="inline-flex items-center gap-2 font-body font-normal text-vsg-gold-400 hover:text-vsg-gold-300 transition-colors"
          >
            Neuen Link anfordern
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
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            </svg>
          </RouterLink>
        </div>

        <!-- Valid Token - Show Form -->
        <template v-else>
          <div class="text-center mb-8">
            <h1
              class="font-display text-3xl md:text-4xl tracking-wider text-white text-glow"
            >
              NEUES PASSWORT
            </h1>
            <p class="font-body font-normal text-vsg-blue-200 mt-2">
              Gib dein neues Passwort ein.
            </p>
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
          Zuruck zum Login
        </RouterLink>
      </div>
    </div>
  </section>
</template>
