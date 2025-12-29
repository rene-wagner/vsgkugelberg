<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const props = defineProps<{
  token: string;
}>();

const password = ref('');
const confirmPassword = ref('');
const error = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false);
const successMessage = ref('');

const authStore = useAuthStore();

async function handleSubmit() {
  error.value = '';

  // Validate passwords match
  if (password.value !== confirmPassword.value) {
    error.value = 'Die Passwoerter stimmen nicht ueberein.';
    return;
  }

  isLoading.value = true;

  try {
    const result = await authStore.resetPassword(props.token, password.value);
    if (result.success) {
      isSubmitted.value = true;
      successMessage.value =
        result.message || 'Dein Passwort wurde erfolgreich geaendert.';
    } else {
      error.value =
        result.message ||
        'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
    }
  } catch {
    error.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <!-- Success State -->
  <div v-if="isSubmitted" class="text-center animate-slide-up">
    <div
      class="w-16 h-16 mx-auto mb-4 bg-vsg-gold-400/20 rounded-full flex items-center justify-center"
    >
      <svg
        class="w-8 h-8 text-vsg-gold-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
    <p class="font-body font-normal text-vsg-blue-100 mb-6">
      {{ successMessage }}
    </p>
    <RouterLink
      to="/login"
      class="inline-flex items-center gap-2 font-body font-normal text-vsg-gold-400 hover:text-vsg-gold-300 transition-colors"
    >
      Zum Login
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

  <!-- Form -->
  <form v-else class="space-y-6" @submit.prevent="handleSubmit">
    <div
      v-if="error"
      class="rounded-lg bg-red-500/20 border border-red-500/30 p-4"
    >
      <p class="text-sm text-red-300">{{ error }}</p>
    </div>

    <!-- New Password Input -->
    <div class="animate-slide-up delay-300">
      <label
        for="password"
        class="block font-body font-normal text-sm tracking-wider text-vsg-gold-400 uppercase mb-2"
      >
        Neues Passwort
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        minlength="8"
        class="form-input-custom w-full px-4 py-3 bg-vsg-blue-800/50 border border-vsg-gold-400/30 rounded-lg text-white placeholder-vsg-blue-300 focus:outline-none focus:border-vsg-gold-400"
        placeholder="********"
      />
      <p class="mt-1 text-xs text-vsg-blue-300">
        Min. 8 Zeichen, Gross-/Kleinbuchstaben und Zahl
      </p>
    </div>

    <!-- Confirm Password Input -->
    <div class="animate-slide-up delay-400">
      <label
        for="confirmPassword"
        class="block font-body font-normal text-sm tracking-wider text-vsg-gold-400 uppercase mb-2"
      >
        Passwort bestaetigen
      </label>
      <input
        id="confirmPassword"
        v-model="confirmPassword"
        type="password"
        required
        minlength="8"
        class="form-input-custom w-full px-4 py-3 bg-vsg-blue-800/50 border border-vsg-gold-400/30 rounded-lg text-white placeholder-vsg-blue-300 focus:outline-none focus:border-vsg-gold-400"
        placeholder="********"
      />
    </div>

    <!-- Submit Button -->
    <div class="animate-slide-up delay-500">
      <button
        type="submit"
        :disabled="isLoading"
        class="btn-primary w-full bg-vsg-gold-400 text-vsg-blue-900 px-6 py-4 font-display text-xl tracking-wider rounded-lg gold-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {{ isLoading ? 'WIRD GESPEICHERT...' : 'PASSWORT SPEICHERN' }}
      </button>
    </div>
  </form>
</template>
