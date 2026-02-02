<script setup lang="ts">
import { onMounted } from 'vue';
import { useStatutesStore } from '../../stores/statutesStore';
import VsgMarkdownRenderer from '@/shared/components/VsgMarkdownRenderer.vue';
import VsgApiState from '@/shared/components/VsgApiState.vue';
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

      <VsgApiState
        :is-loading="statutesStore.isLoading"
        :error="statutesStore.error"
        :empty="!statutesStore.statutes?.content"
        empty-message="Die Satzung wird derzeit aktualisiert."
      >
        <div class="prose prose-lg max-w-none">
          <VsgMarkdownRenderer :content="statutesStore.statutes!.content" />
        </div>
      </VsgApiState>
    </VsgContentSection>
  </div>
</template>
