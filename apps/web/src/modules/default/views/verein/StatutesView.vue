<script setup lang="ts">
// Static statutes page - placeholder for PDF download
</script>

<template>
  <div class="bg-white">
    <!-- Header Section -->
    <section class="bg-vsg-blue-900 pb-20 pt-40">
      <div class="mx-auto max-w-4xl px-6 text-center">
        <h1 class="font-display text-5xl tracking-wider text-white md:text-7xl">
          SATZUNG
        </h1>
        <p class="mt-4 font-body text-lg text-vsg-blue-200">
          Die Vereinssatzung des VSG Kugelberg
        </p>
      </div>
    </section>

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="space-y-12">
          <!-- Introduction -->
          <div>
            <h2
              class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl"
            >
              Unsere Vereinssatzung
            </h2>
            <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              Die Satzung bildet das rechtliche Fundament unseres Vereins. Sie
              regelt die Organisation, die Rechte und Pflichten der Mitglieder
              sowie die Grundsatze unserer Vereinsarbeit.
            </p>
          </div>

          <!-- Download Section -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <h2
              class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl"
            >
              Satzung herunterladen
            </h2>

            <div
              class="mt-8 rounded-xl border-2 border-dashed border-vsg-blue-200 bg-vsg-blue-50 p-8 text-center"
            >
              <div
                class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-vsg-gold-400"
              >
                <svg
                  class="h-8 w-8 text-vsg-blue-900"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3
                class="mt-4 font-display text-xl tracking-wider text-vsg-blue-900"
              >
                Satzung als PDF
              </h3>
              <p class="mt-2 font-body text-vsg-blue-600">
                Die vollstandige Vereinssatzung steht hier zum Download bereit.
              </p>
              <button
                class="mt-6 inline-flex items-center gap-2 rounded-lg bg-vsg-gold-400 px-6 py-3 font-display text-lg tracking-wider text-vsg-blue-900 transition-all hover:bg-vsg-gold-500"
                disabled
              >
                <svg
                  class="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                PDF herunterladen
              </button>
              <p class="mt-4 font-body text-sm text-vsg-blue-500 italic">
                [PDF wird noch bereitgestellt]
              </p>
            </div>
          </div>

          <!-- Key Points -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <h2
              class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl"
            >
              Wichtige Inhalte
            </h2>

            <div class="mt-8 grid gap-6 md:grid-cols-2">
              <div class="rounded-xl border border-vsg-blue-100 bg-white p-6">
                <h3
                  class="font-display text-lg tracking-wider text-vsg-blue-900"
                >
                  Name und Sitz
                </h3>
                <p class="mt-2 font-body text-vsg-blue-700">
                  Der Verein fuhrt den Namen "VSG Kugelberg e.V." und hat seinen
                  Sitz in Weissenfels.
                </p>
              </div>

              <div class="rounded-xl border border-vsg-blue-100 bg-white p-6">
                <h3
                  class="font-display text-lg tracking-wider text-vsg-blue-900"
                >
                  Vereinszweck
                </h3>
                <p class="mt-2 font-body text-vsg-blue-700">
                  Forderung des Sports und der korperlichen Erttuchtigung seiner
                  Mitglieder.
                </p>
              </div>

              <div class="rounded-xl border border-vsg-blue-100 bg-white p-6">
                <h3
                  class="font-display text-lg tracking-wider text-vsg-blue-900"
                >
                  Mitgliedschaft
                </h3>
                <p class="mt-2 font-body text-vsg-blue-700">
                  Regelungen zu Aufnahme, Austritt und Rechten der Mitglieder.
                </p>
              </div>

              <div class="rounded-xl border border-vsg-blue-100 bg-white p-6">
                <h3
                  class="font-display text-lg tracking-wider text-vsg-blue-900"
                >
                  Organe des Vereins
                </h3>
                <p class="mt-2 font-body text-vsg-blue-700">
                  Mitgliederversammlung, Vorstand und deren Aufgaben.
                </p>
              </div>
            </div>
          </div>

          <!-- Contact Note -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <div
              class="rounded-xl border border-vsg-blue-100 bg-vsg-blue-50 p-6"
            >
              <p class="font-body text-lg text-vsg-blue-700">
                <strong class="text-vsg-blue-900">Fragen zur Satzung?</strong>
                Wenden Sie sich gerne an unseren Vorstand uber die
                <a
                  href="/contact"
                  class="text-vsg-gold-600 underline hover:text-vsg-gold-700"
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
