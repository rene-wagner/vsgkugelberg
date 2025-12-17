<script setup lang="ts">
import LoginForm from '../components/LoginForm.vue';
</script>

<template>
  <div
    class="min-h-screen bg-gray-100 flex flex-col items-center justify-center px-4"
  >
    <div class="w-full max-w-md">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900">VSG Kugelberg</h1>
        <p class="mt-2 text-gray-600">Sign in to your account</p>
      </div>

      <div class="bg-white rounded-lg shadow-md p-8">
        <LoginForm />
      </div>
    </div>
  </div>
</template>
