<script setup lang="ts"></script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden">
    <!-- Background gradient overlay -->
    <div class="fixed inset-0 bg-linear-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent"></div>

    <!-- Decorative elements -->
    <div class="fixed top-1/4 right-0 w-96 h-96 bg-vsg-gold-400/10 rounded-full blur-3xl"></div>
    <div class="fixed bottom-1/4 left-0 w-80 h-80 bg-vsg-blue-500/20 rounded-full blur-3xl"></div>

    <!-- Content -->
    <div class="relative z-10 min-h-screen">
      <router-view />
    </div>
  </div>
</template>
