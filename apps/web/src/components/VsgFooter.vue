<script lang="ts" setup>
import { computed } from 'vue';
import { RouterLink } from 'vue-router';

const year = computed(() => new Date().getFullYear());
</script>

<template>
  <footer className="bg-[#00295e] text-white py-12">
    <div className="container mx-auto px-4">
      <div className="grid md:grid-cols-2 gap-8">
        <!-- Kontakt -->
        <div>
          <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
          <div className="space-y-2 text-gray-300">
            <p>Sportverein e.V.</p>
            <p>Musterstraße 123</p>
            <p>12345 Musterstadt</p>
            <p>Tel: (0123) 456-789</p>
            <p>E-Mail: info@sportverein.de</p>
          </div>
        </div>

        <!-- Links -->
        <div>
          <h3 className="text-lg font-semibold mb-4">Rechtliches</h3>
          <div className="space-y-2">
            <RouterLink
              to="/impressum"
              class="block text-gray-300 hover:text-[#ddad1e] transition-colors"
            >
              Impressum
            </RouterLink>
            <RouterLink
              to="/datenschutz"
              class="block text-gray-300 hover:text-[#ddad1e] transition-colors"
            >
              Datenschutz
            </RouterLink>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
        <p>&copy; {{ year }} VSG Kugelberg e.V. Weißenfels. Alle Rechte vorbehalten.</p>
      </div>
    </div>
  </footer>
</template>
