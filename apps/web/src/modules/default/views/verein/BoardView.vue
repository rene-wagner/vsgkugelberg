<script setup lang="ts">
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

// Static board members page - placeholder for future integration with Contact Persons
</script>

<template>
  <div class="bg-white">
    <!-- Header Section -->
    <section class="bg-vsg-blue-900 pb-20 pt-40">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h1 class="font-display text-5xl tracking-wider text-white md:text-7xl">VORSTAND</h1>
        <p class="mt-4 font-body text-lg text-vsg-blue-200">Die Fuhrung des VSG Kugelberg</p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="space-y-12">
          <!-- Introduction -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Unser Vorstand</h2>
            <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              Der Vorstand des VSG Kugelberg e.V. setzt sich aus engagierten Mitgliedern zusammen, die ehrenamtlich die Geschicke des Vereins lenken.
              Gemeinsam arbeiten wir daran, den Verein weiterzuentwickeln und unseren Mitgliedern ein attraktives Sportangebot zu bieten.
            </p>
          </div>

          <!-- Board Members Placeholder -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Vorstandsmitglieder</h2>

            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <!-- Placeholder Card 1 -->
              <div class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-vsg-gold-400">
                    <FontAwesomeIcon
                      icon="user"
                      class="text-vsg-blue-900"
                    />
                  </div>
                  <div>
                    <span class="inline-block rounded-full bg-vsg-gold-400 px-3 py-1 text-sm font-body text-vsg-blue-900">
                      Vorstandsvorsitzender
                    </span>
                    <p class="mt-2 font-body text-lg text-vsg-blue-600 italic">[Name wird noch bekannt gegeben]</p>
                  </div>
                </div>
              </div>

              <!-- Placeholder Card 2 -->
              <div class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-vsg-blue-200">
                    <FontAwesomeIcon
                      icon="user"
                      class="text-vsg-blue-900"
                    />
                  </div>
                  <div>
                    <span class="inline-block rounded-full bg-vsg-blue-200 px-3 py-1 text-sm font-body text-vsg-blue-900">
                      Stellvertretender Vorsitzender
                    </span>
                    <p class="mt-2 font-body text-lg text-vsg-blue-600 italic">[Name wird noch bekannt gegeben]</p>
                  </div>
                </div>
              </div>

              <!-- Placeholder Card 3 -->
              <div class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-vsg-blue-200">
                    <FontAwesomeIcon
                      icon="user"
                      class="text-vsg-blue-900"
                    />
                  </div>
                  <div>
                    <span class="inline-block rounded-full bg-vsg-blue-200 px-3 py-1 text-sm font-body text-vsg-blue-900"> Schatzmeister </span>
                    <p class="mt-2 font-body text-lg text-vsg-blue-600 italic">[Name wird noch bekannt gegeben]</p>
                  </div>
                </div>
              </div>

              <!-- Placeholder Card 4 -->
              <div class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6">
                <div class="flex items-start gap-4">
                  <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-vsg-blue-200">
                    <FontAwesomeIcon
                      icon="user"
                      class="text-vsg-blue-900"
                    />
                  </div>
                  <div>
                    <span class="inline-block rounded-full bg-vsg-blue-200 px-3 py-1 text-sm font-body text-vsg-blue-900"> Schriftfuhrer </span>
                    <p class="mt-2 font-body text-lg text-vsg-blue-600 italic">[Name wird noch bekannt gegeben]</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Note -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <div class="rounded-xl bg-vsg-blue-50 border border-vsg-blue-100 p-6">
              <p class="font-body text-lg text-vsg-blue-700">
                <strong class="text-vsg-blue-900">Hinweis:</strong>
                Für Anfragen an den Vorstand nutzen Sie bitte unsere
                <a
                  href="/kontakt"
                  class="text-vsg-gold-600 hover:text-vsg-gold-700 underline"
                  >Kontaktseite</a
                >.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
