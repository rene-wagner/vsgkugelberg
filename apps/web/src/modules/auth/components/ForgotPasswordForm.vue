<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

const email = ref('');
const error = ref('');
const isLoading = ref(false);
const isSubmitted = ref(false);
const successMessage = ref('');

const authStore = useAuthStore();

async function handleSubmit() {
  error.value = '';
  isLoading.value = true;

  try {
    const result = await authStore.requestPasswordReset(email.value);
    if (result.success) {
      isSubmitted.value = true;
      successMessage.value = result.message || 'Falls ein Konto mit dieser E-Mail existiert, wurde ein Link gesendet.';
    } else {
      error.value = result.message || 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
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
  <div
    v-if="isSubmitted"
    class="text-center animate-slide-up"
  >
    <div class="w-16 h-16 mx-auto mb-4 bg-vsg-gold-400/20 rounded-full flex items-center justify-center">
      <FontAwesomeIcon
        icon="check"
        class="text-vsg-gold-400"
      />
    </div>
    <p class="font-body font-normal text-vsg-blue-100">
      {{ successMessage }}
    </p>
  </div>

  <!-- Form -->
  <form
    v-else
    class="space-y-6"
    @submit.prevent="handleSubmit"
  >
    <div
      v-if="error"
      class="rounded-lg bg-red-500/20 border border-red-500/30 p-4"
    >
      <p class="text-sm text-red-300">{{ error }}</p>
    </div>

    <!-- Email Input -->
    <div class="animate-slide-up delay-300">
      <label
        for="email"
        class="block font-body font-normal text-sm tracking-wider text-vsg-gold-400 uppercase mb-2"
      >
        E-Mail Adresse
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="form-input-custom w-full px-4 py-3 bg-vsg-blue-800/50 border border-vsg-gold-400/30 rounded-lg text-white placeholder-vsg-blue-300 focus:outline-none focus:border-vsg-gold-400"
        placeholder="deine@email.de"
      />
    </div>

    <!-- Submit Button -->
    <div class="animate-slide-up delay-400">
      <button
        type="submit"
        :disabled="isLoading"
        class="btn-primary w-full bg-vsg-gold-400 text-vsg-blue-900 px-6 py-4 font-display text-xl tracking-wider rounded-lg gold-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
      >
        {{ isLoading ? 'WIRD GESENDET...' : 'LINK ANFORDERN' }}
      </button>
    </div>
  </form>
</template>
