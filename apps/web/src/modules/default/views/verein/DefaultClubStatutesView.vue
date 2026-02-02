<script setup lang="ts">
import { onMounted } from 'vue';
import { useStatutesStore } from '../../stores/statutesStore';
import VsgMarkdownRenderer from '@/shared/components/VsgMarkdownRenderer.vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgHeroSection from '../../components/VsgHeroSection.vue';
import VsgContentSection from '../../components/VsgContentSection.vue';
import VsgAlert from '@/shared/components/VsgAlert.vue';

const statutesStore = useStatutesStore();

onMounted(async () => {
  await statutesStore.fetchStatutes();
});
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="SATZUNG"
      description="Die Vereinssatzung des VSG Kugelberg e.V."
      min-height="70vh"
    />

    <VsgContentSection>
      <VsgAlert variant="info">
        <p class="font-body text-lg text-vsg-blue-700">
          <strong class="text-vsg-blue-900">Fragen zur Satzung?</strong>
          Wenden Sie sich gerne an unseren Vorstand über die
          <RouterLink
            to="/kontakt"
            class="text-vsg-gold-600 underline hover:text-vsg-gold-700"
          >
            Kontaktseite </RouterLink
          >.
        </p>
      </VsgAlert>

      <!-- Loading State -->
      <div
        v-if="statutesStore.isLoading"
        class="flex justify-center py-12"
      >
        <FontAwesomeIcon
          icon="spinner"
          spin
          class="text-4xl text-vsg-gold-400"
        />
      </div>

      <!-- Error State -->
      <div
        v-else-if="statutesStore.error"
        class="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
      >
        <p class="font-body text-red-600">{{ statutesStore.error }}</p>
      </div>

      <!-- No Content State -->
      <div
        v-else-if="!statutesStore.statutes?.content"
        class="rounded-xl border border-vsg-blue-200 bg-vsg-blue-50 p-6 text-center"
      >
        <p class="font-body text-vsg-blue-600">Die Satzung wird derzeit aktualisiert.</p>
      </div>

      <!-- Statutes Content -->
      <div
        v-else
        class="prose prose-lg max-w-none"
      >
        <VsgMarkdownRenderer :content="statutesStore.statutes.content" />
      </div>
    </VsgContentSection>
  </div>
</template>
