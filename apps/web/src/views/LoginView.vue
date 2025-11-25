<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '@/stores/user';
import { login } from '@/utils/apiClient';

const router = useRouter();
const userStore = useUserStore();

const username = ref('');
const password = ref('');
const isSubmitting = ref(false);
const errorMessage = ref<string | null>(null);

const canSubmit = computed(() => {
  return !isSubmitting.value && username.value.trim() !== '' && password.value.trim() !== '';
});

const handleSubmit = async () => {
  if (!canSubmit.value) return;

  isSubmitting.value = true;
  errorMessage.value = null;

  try {
    const user = await login({ username: username.value, password: password.value });
    userStore.setUser(user);
    await router.push({ name: 'home' });
  } catch (error) {
    errorMessage.value = 'Anmeldung fehlgeschlagen. Bitte prüfe deine Eingaben und versuche es erneut.';
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<template>
  <main class="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h1 class="mt-2 text-center text-3xl font-extrabold text-gray-900">Anmeldung</h1>
        <p class="mt-2 text-center text-sm text-gray-600">Melde dich mit deinem Benutzernamen an.</p>
      </div>

      <div v-if="errorMessage" class="rounded-md bg-red-50 p-4" role="alert">
        <p class="text-sm font-medium text-red-800">{{ errorMessage }}</p>
      </div>

      <form class="mt-8 space-y-6" autocomplete="on" @submit.prevent="handleSubmit">
        <div class="space-y-4">
          <div>
            <label for="username" class="block text-sm font-medium text-gray-700">Benutzername</label>
            <input
              id="username"
              v-model="username"
              name="username"
              type="text"
              autocomplete="username"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00295e] focus:outline-none focus:ring-1 focus:ring-[#00295e]"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-700">Passwort</label>
            <input
              id="password"
              v-model="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#00295e] focus:outline-none focus:ring-1 focus:ring-[#00295e]"
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            class="group relative flex w-full justify-center rounded-md border border-transparent bg-[#00295e] py-2 px-4 text-sm font-medium text-white hover:bg-[#001f49] focus:outline-none focus:ring-2 focus:ring-[#00295e] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!canSubmit"
          >
            Login
          </button>
        </div>
      </form>
    </div>
  </main>
</template>
