<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const email = ref('');
const password = ref('');
const error = ref('');
const isLoading = ref(false);

const router = useRouter();
const authStore = useAuthStore();

async function handleSubmit() {
  error.value = '';
  isLoading.value = true;

  try {
    const success = await authStore.login(email.value, password.value);
    if (success) {
      router.push('/');
    } else {
      error.value = 'Invalid email or password';
    }
  } catch {
    error.value = 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="space-y-6" @submit.prevent="handleSubmit">
    <div v-if="error" class="rounded-md bg-red-50 p-4">
      <p class="text-sm text-red-700">{{ error }}</p>
    </div>

    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <input
        id="email"
        v-model="email"
        type="email"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="you@example.com"
      />
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        id="password"
        v-model="password"
        type="password"
        required
        class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        placeholder="Enter your password"
      />
    </div>

    <button
      type="submit"
      :disabled="isLoading"
      class="w-full rounded-md bg-blue-600 px-4 py-2 text-white font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {{ isLoading ? 'Signing in...' : 'Sign in' }}
    </button>
  </form>
</template>
