<script setup lang="ts">
// Placeholder admin layout - design to be refined later
</script>

<template>
  <div class="min-h-screen bg-gray-100">
    <!-- Admin Header (placeholder) -->
    <header class="border-b border-gray-200 bg-white px-6 py-4 shadow-sm">
      <div class="mx-auto flex max-w-7xl items-center justify-between">
        <div class="flex items-center gap-3">
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-vsg-blue-600"
          >
            <span class="font-display text-lg text-white">VK</span>
          </div>
          <div>
            <span class="font-display text-xl tracking-wider text-gray-900"
              >VSG KUGELBERG</span
            >
            <span
              class="ml-2 rounded bg-vsg-blue-100 px-2 py-0.5 font-body text-xs font-medium text-vsg-blue-700"
              >Admin</span
            >
          </div>
        </div>
        <nav class="flex items-center gap-6">
          <a
            href="/"
            class="font-body text-sm text-gray-600 transition-colors hover:text-vsg-blue-600"
          >
            Zur Website
          </a>
          <a
            href="/login"
            class="font-body text-sm text-gray-600 transition-colors hover:text-vsg-blue-600"
          >
            Abmelden
          </a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="mx-auto max-w-7xl px-6 py-8">
      <router-view />
    </main>
  </div>
</template>
