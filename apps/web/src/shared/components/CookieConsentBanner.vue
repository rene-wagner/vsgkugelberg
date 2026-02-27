<script setup lang="ts">
import { ref } from 'vue';

const STORAGE_KEY = 'cookie_consent';

function readStoredConsent(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null;
  } catch {
    // localStorage unavailable — show banner (opt-in bias)
    return true;
  }
}

const isVisible = ref<boolean>(readStoredConsent());

function setConsent(value: 'accepted' | 'declined'): void {
  try {
    localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Silently ignore write failure; banner is hidden for the session
  }
  isVisible.value = false;
}

function acceptConsent(): void {
  setConsent('accepted');
}

function declineConsent(): void {
  setConsent('declined');
}
</script>

<template>
  <div
    v-if="isVisible"
    class="fixed bottom-0 left-0 right-0 z-50 bg-vsg-blue-900 border-t border-vsg-gold-400/20 shadow-lg"
    role="region"
    aria-label="Cookie-Einwilligung"
  >
    <div class="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
      <p class="flex-1 font-body font-normal text-sm text-vsg-blue-100 leading-relaxed">
        Diese Website kann Cookies verwenden, um Ihr Nutzungserlebnis zu verbessern. Mit einem Klick auf
        <strong class="text-white">„Akzeptieren"</strong> stimmen Sie der Verwendung zu. Mit <strong class="text-white">„Ablehnen"</strong> werden nur
        technisch notwendige Cookies gesetzt. Weitere Informationen finden Sie in unserer
        <a
          href="/datenschutz"
          class="underline text-vsg-gold-300 hover:text-vsg-gold-200 transition-colors"
          >Datenschutzerklärung</a
        >.
      </p>
      <div class="flex items-center gap-3 shrink-0">
        <button
          type="button"
          class="px-5 py-2 font-display tracking-wider text-sm border-2 border-vsg-gold-400/50 text-vsg-gold-400 hover:bg-vsg-gold-400/10 transition-colors"
          @click="declineConsent"
        >
          Ablehnen
        </button>
        <button
          type="button"
          class="px-5 py-2 font-display tracking-wider text-sm bg-vsg-gold-400 text-vsg-blue-900 hover:bg-vsg-gold-300 transition-colors"
          @click="acceptConsent"
        >
          Akzeptieren
        </button>
      </div>
    </div>
  </div>
</template>
