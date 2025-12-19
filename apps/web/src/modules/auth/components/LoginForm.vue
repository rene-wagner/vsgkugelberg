<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const username = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

async function handleSubmit() {
  error.value = '';
  isLoading.value = true;

  try {
    const success = await authStore.login(username.value, password.value);
    if (success) {
      router.push('/admin');
    } else {
      error.value = 'Ungultiger Benutzername oder Passwort';
    }
  } catch {
    error.value = 'Ein Fehler ist aufgetreten. Bitte versuche es erneut.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div
      v-if="error"
      class="rounded-lg bg-red-500/20 border border-red-500/30 p-4"
    >
      <p class="text-sm text-red-300">{{ error }}</p>
    </div>

    <!-- Username Input -->
    <div class="animate-slide-up delay-300">
      <label
        for="username"
        class="block font-body font-normal text-sm tracking-wider text-vsg-gold-400 uppercase mb-2"
      >
        Benutzername
      </label>
      <input
        id="username"
        v-model="username"
        type="text"
        required
        class="form-input-custom w-full px-4 py-3 bg-vsg-blue-800/50 border border-vsg-gold-400/30 rounded-lg text-white placeholder-vsg-blue-300 focus:outline-none focus:border-vsg-gold-400"
        placeholder="dein_benutzername"
      />
    </div>

    <!-- Password Input -->
    <div class="animate-slide-up delay-400">
      <label
        for="password"
        class="block font-body font-normal text-sm tracking-wider text-vsg-gold-400 uppercase mb-2"
      >
        Passwort
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
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
        {{ isLoading ? 'ANMELDEN...' : 'ANMELDEN' }}
      </button>
    </div>
  </form>
</template>
