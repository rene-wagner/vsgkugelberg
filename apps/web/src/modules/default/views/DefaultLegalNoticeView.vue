<script setup lang="ts">
import VsgHeroSection from '../components/VsgHeroSection.vue';
import VsgContentSection from '../components/VsgContentSection.vue';
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="IMPRESSUM"
      description="Angaben gemäß § 5 TMG"
      min-height="70vh"
    />

    <VsgContentSection>
      <div class="space-y-12">
        <!-- Name des Vereins -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Name des Vereins</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">VSG Kugelberg e.V.</p>
        </div>

        <!-- Vertretungsberechtigte -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Vertretungsberechtigte</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            Vorstand:
            <span class="text-vsg-gold-600">[Vorstand einfügen]</span>
          </p>
        </div>

        <!-- Anschrift -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Anschrift</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            <span class="text-vsg-gold-600">[Adresse einfügen]</span><br />
            <span class="text-vsg-gold-600">[PLZ Ort einfügen]</span>
          </p>
        </div>

        <!-- Kontakt -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Kontakt</h2>
          <div class="mt-4 space-y-2 font-body text-lg text-vsg-blue-700">
            <p>E-Mail: <span class="text-vsg-gold-600">[E-Mail einfügen]</span></p>
            <p>
              Telefon:
              <span class="text-vsg-gold-600">[Telefon einfügen]</span>
            </p>
          </div>
        </div>

        <!-- Registergericht -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Registergericht</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            Amtsgericht
            <span class="text-vsg-gold-600">[Stadt einfügen]</span>
          </p>
        </div>

        <!-- Registernummer -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Registernummer</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">VR <span class="text-vsg-gold-600">[Nummer einfügen]</span></p>
        </div>

        <!-- Inhaltlich Verantwortlicher -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Inhaltlich Verantwortlicher</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            gemäß § 55 Abs. 2 RStV:<br />
            <span class="text-vsg-gold-600">[Name einfügen]</span><br />
            <span class="text-vsg-gold-600">[Adresse einfügen]</span>
          </p>
        </div>

        <!-- Haftungsausschluss -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Haftungsausschluss</h2>
          <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            <p>
              <strong class="text-vsg-blue-900">Haftung für Inhalte:</strong>
              Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können
              wir jedoch keine Gewähr übernehmen.
            </p>
            <p>
              <strong class="text-vsg-blue-900">Haftung für Links:</strong>
              Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese
              fremden Inhalte auch keine Gewähr übernehmen.
            </p>
          </div>
        </div>
      </div>
    </VsgContentSection>
  </div>
</template>
