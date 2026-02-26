<script setup lang="ts">
import { RouterLink, useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
import { useAuthStore } from '@/modules/auth/stores/authStore';
import VsgToastContainer from '@shared/components/VsgToastContainer.vue';
import AdminSidebar from '@shared/components/AdminSidebar.vue';
import VsgLogo from '@shared/components/VsgLogo.vue';

const isUserMenuOpen = ref(false);
const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}
</script>

<template>
  <div class="min-h-screen text-vsg-blue-900 overflow-x-hidden">
    <!-- Header -->
    <header class="fixed top-0 left-0 right-0 z-50 h-16 bg-vsg-blue-900 border-b border-vsg-gold-400/20">
      <div class="h-full px-6 flex items-center justify-between">
        <!-- Logo -->
        <RouterLink
          to="/"
          class="flex items-center"
        >
          <VsgLogo class="h-10" />
        </RouterLink>

        <!-- User Menu -->
        <div
          class="relative"
          @mouseenter="isUserMenuOpen = true"
          @mouseleave="isUserMenuOpen = false"
        >
          <button class="flex items-center gap-3 p-2 rounded-lg hover:bg-vsg-blue-800 transition-colors">
            <span class="hidden sm:block font-body font-normal text-sm text-vsg-blue-200">{{ authStore.user?.username ?? 'Benutzer' }}</span>
            <div class="w-10 h-10 bg-vsg-blue-700 rounded-full flex items-center justify-center border-2 border-vsg-gold-400/30">
              <FontAwesomeIcon
                icon="user"
                class="text-vsg-gold-400"
              />
            </div>
          </button>

          <!-- Dropdown Menu -->
          <Transition
            enter-active-class="transition-all duration-200"
            enter-from-class="opacity-0 translate-y-2"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 translate-y-2"
          >
            <div
              v-if="isUserMenuOpen"
              class="absolute top-full right-0 mt-2 w-48 bg-vsg-blue-900 border border-vsg-gold-400/20 rounded-lg shadow-xl"
            >
              <div class="py-2">
                <div class="px-4 py-2 border-b border-vsg-gold-400/10">
                  <span class="block font-body text-sm text-white">{{ authStore.user?.username ?? 'Benutzer' }}</span>
                  <span class="block font-body font-normal text-xs text-vsg-blue-300">{{ authStore.user?.email ?? '' }}</span>
                </div>
                <button
                  type="button"
                  class="flex items-center gap-2 px-4 py-2 w-full font-body font-normal text-sm text-vsg-gold-300 hover:text-vsg-gold-400 hover:bg-vsg-blue-800/50 transition-colors"
                  @click="handleLogout"
                >
                  <FontAwesomeIcon icon="arrow-right-from-bracket" />
                  Abmelden
                </button>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- Main Layout -->
    <div class="flex pt-16 min-h-screen">
      <AdminSidebar :current-path="route.path" />

      <!-- Main Content -->
      <main class="flex-1 ml-64 p-8 bg-white min-h-screen">
        <router-view />
      </main>
    </div>
    <VsgToastContainer />
  </div>
</template>
