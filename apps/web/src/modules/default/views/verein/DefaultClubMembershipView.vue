<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import VsgHeroSection from '../../components/VsgHeroSection.vue';
import VsgContentSection from '../../components/VsgContentSection.vue';

// Static membership information page
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="Mitgliedschaft"
      description="Werde Teil des VSG Kugelberg"
      min-height="70vh"
    />

    <VsgContentSection>
      <div class="space-y-12">
        <!-- Introduction -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Mitglied werden</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            Der VSG Kugelberg e.V. heisst alle Sportbegeisterten herzlich willkommen! Egal ob Anfanger oder Fortgeschrittener - bei uns findet jeder
            seinen Platz. Werden Sie Teil unserer Vereinsgemeinschaft und profitieren Sie von zahlreichen Vorteilen.
          </p>
        </div>

        <!-- Benefits Section -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Ihre Vorteile als Mitglied</h2>

          <div class="mt-8 grid gap-6 md:grid-cols-2">
            <div class="flex gap-4 rounded-xl border border-vsg-blue-100 bg-white p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vsg-gold-400">
                <FontAwesomeIcon
                  icon="users"
                  class="text-vsg-blue-900"
                />
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Gemeinschaft</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Teil einer aktiven Sportgemeinschaft sein und neue Kontakte knupfen.</p>
              </div>
            </div>

            <div class="flex gap-4 rounded-xl border border-vsg-blue-100 bg-white p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vsg-gold-400">
                <FontAwesomeIcon
                  icon="bolt"
                  class="text-vsg-blue-900"
                />
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Training</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Regelmassiges Training in verschiedenen Abteilungen unter fachkundiger Anleitung.</p>
              </div>
            </div>

            <div class="flex gap-4 rounded-xl border border-vsg-blue-100 bg-white p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vsg-gold-400">
                <FontAwesomeIcon
                  icon="check"
                  class="text-vsg-blue-900"
                />
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Wettkampfe</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Teilnahme an Wettkampfen und Turnieren in der Region und daruber hinaus.</p>
              </div>
            </div>

            <div class="flex gap-4 rounded-xl border border-vsg-blue-100 bg-white p-6">
              <div class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-vsg-gold-400">
                <FontAwesomeIcon
                  icon="calendar"
                  class="text-vsg-blue-900"
                />
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Veranstaltungen</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Vereinsfeste, Ausflüge und gesellige Veranstaltungen rund ums Jahr.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Fee Structure -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Beitragsstruktur</h2>
          <p class="mt-4 font-body text-lg text-vsg-blue-700">Unsere Mitgliedsbeitrage sind fair und sozialvertraglich gestaltet.</p>

          <div class="mt-8 overflow-hidden rounded-xl border border-vsg-blue-200">
            <table class="w-full">
              <thead class="bg-vsg-blue-900">
                <tr>
                  <th class="px-6 py-4 text-left font-display tracking-wider text-white">Mitgliedsart</th>
                  <th class="px-6 py-4 text-right font-display tracking-wider text-white">Beitrag / Monat</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-vsg-blue-100">
                <tr class="bg-white">
                  <td class="px-6 py-4 font-body text-vsg-blue-900">Erwachsene (ab 18 Jahre)</td>
                  <td class="px-6 py-4 text-right font-body text-vsg-blue-900">
                    <span class="text-vsg-gold-600">[Betrag einfugen]</span>
                  </td>
                </tr>
                <tr class="bg-vsg-blue-50">
                  <td class="px-6 py-4 font-body text-vsg-blue-900">Jugendliche (14-17 Jahre)</td>
                  <td class="px-6 py-4 text-right font-body text-vsg-blue-900">
                    <span class="text-vsg-gold-600">[Betrag einfugen]</span>
                  </td>
                </tr>
                <tr class="bg-white">
                  <td class="px-6 py-4 font-body text-vsg-blue-900">Kinder (bis 13 Jahre)</td>
                  <td class="px-6 py-4 text-right font-body text-vsg-blue-900">
                    <span class="text-vsg-gold-600">[Betrag einfugen]</span>
                  </td>
                </tr>
                <tr class="bg-vsg-blue-50">
                  <td class="px-6 py-4 font-body text-vsg-blue-900">Familien (Ermassigung)</td>
                  <td class="px-6 py-4 text-right font-body text-vsg-blue-900">
                    <span class="text-vsg-gold-600">[Betrag einfugen]</span>
                  </td>
                </tr>
                <tr class="bg-white">
                  <td class="px-6 py-4 font-body text-vsg-blue-900">Passive Mitgliedschaft</td>
                  <td class="px-6 py-4 text-right font-body text-vsg-blue-900">
                    <span class="text-vsg-gold-600">[Betrag einfugen]</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- How to Join -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">So werden Sie Mitglied</h2>

          <div class="mt-8 space-y-6">
            <div class="flex gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vsg-gold-400 font-display text-lg text-vsg-blue-900">
                1
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Kontakt aufnehmen</h3>
                <p class="mt-1 font-body text-vsg-blue-700">
                  Nehmen Sie Kontakt mit uns auf oder besuchen Sie eines unserer Trainings zum Schnuppern.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vsg-gold-400 font-display text-lg text-vsg-blue-900">
                2
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Aufnahmeantrag ausfullen</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Fullen Sie den Aufnahmeantrag aus und geben Sie ihn bei unserem Vorstand ab.</p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-vsg-gold-400 font-display text-lg text-vsg-blue-900">
                3
              </div>
              <div>
                <h3 class="font-display text-lg tracking-wider text-vsg-blue-900">Willkommen im Verein!</h3>
                <p class="mt-1 font-body text-vsg-blue-700">Nach Bestatigung Ihrer Mitgliedschaft konnen Sie an allen Aktivitaten teilnehmen.</p>
              </div>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <div class="rounded-xl bg-vsg-blue-900 p-8 text-center">
            <h3 class="font-display text-2xl tracking-wider text-white">Bereit, dabei zu sein?</h3>
            <p class="mt-2 font-body text-vsg-blue-200">Kontaktieren Sie uns für weitere Informationen oder zum Schnuppertraining.</p>
            <a
              href="/kontakt"
              class="mt-6 inline-block rounded-lg bg-vsg-gold-400 px-8 py-3 font-display text-lg tracking-wider text-vsg-blue-900 transition-all hover:bg-vsg-gold-500"
            >
              Kontakt aufnehmen
            </a>
          </div>
        </div>
      </div>
    </VsgContentSection>
  </div>
</template>
