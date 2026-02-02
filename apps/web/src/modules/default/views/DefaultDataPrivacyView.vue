<script setup lang="ts">
import VsgHeroSection from '../components/VsgHeroSection.vue';

// Static privacy policy page - no reactive state needed
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="DATENSCHUTZ"
      description="Datenschutzerklärung gemäß DSGVO"
      min-height="70vh"
    />

    <!-- Content Section -->
    <section class="py-16">
      <div class="mx-auto max-w-4xl px-6">
        <div class="space-y-12">
          <!-- Verantwortliche Stelle -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">1. Verantwortliche Stelle</h2>
            <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
              <p>
                VSG Kugelberg e.V.<br />
                <span class="text-vsg-gold-600">[Adresse einfügen]</span><br />
                <span class="text-vsg-gold-600">[PLZ Ort einfügen]</span>
              </p>
              <p>
                E-Mail: <span class="text-vsg-gold-600">[E-Mail einfügen]</span><br />
                Telefon:
                <span class="text-vsg-gold-600">[Telefon einfügen]</span>
              </p>
            </div>
          </div>

          <!-- Datenerfassung auf der Website -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">2. Datenerfassung auf der Website</h2>
            <div class="mt-4 space-y-6 font-body text-lg leading-relaxed text-vsg-blue-700">
              <!-- Cookies -->
              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Cookies</h3>
                <p>
                  Unsere Website verwendet Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. Sie richten keinen
                  Schaden an und enthalten keine Viren. Cookies dienen dazu, unser Angebot nutzerfreundlicher und effektiver zu gestalten.
                </p>
                <p class="mt-2">
                  Sie können Ihren Browser so einstellen, dass Sie über das Setzen von Cookies informiert werden und Cookies nur im Einzelfall
                  erlauben.
                </p>
              </div>

              <!-- Server-Log-Files -->
              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Server-Log-Files</h3>
                <p>
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Files, die Ihr Browser automatisch
                  an uns übermittelt. Dies sind:
                </p>
                <ul class="mt-2 list-inside list-disc space-y-1 pl-4">
                  <li>Browsertyp und Browserversion</li>
                  <li>Verwendetes Betriebssystem</li>
                  <li>Referrer URL</li>
                  <li>Hostname des zugreifenden Rechners</li>
                  <li>Uhrzeit der Serveranfrage</li>
                  <li>IP-Adresse</li>
                </ul>
                <p class="mt-2">Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.</p>
              </div>

              <!-- Kontaktformular -->
              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Kontaktformular</h3>
                <p>
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort
                  angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben
                  wir nicht ohne Ihre Einwilligung weiter.
                </p>
              </div>
            </div>
          </div>

          <!-- Rechte der Betroffenen -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">3. Rechte der Betroffenen</h2>
            <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              <p>
                Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und
                Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung oder Löschung dieser Daten.
              </p>

              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Auskunftsrecht</h3>
                <p>
                  Sie haben das Recht, eine Bestätigung darüber zu verlangen, ob betreffende Daten verarbeitet werden und auf Auskunft über diese
                  Daten sowie auf weitere Informationen und Kopie der Daten.
                </p>
              </div>

              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Widerrufsrecht</h3>
                <p>
                  Sie haben das Recht, erteilte Einwilligungen jederzeit zu widerrufen. Durch den Widerruf der Einwilligung wird die Rechtmäßigkeit
                  der aufgrund der Einwilligung bis zum Widerruf erfolgten Verarbeitung nicht berührt.
                </p>
              </div>

              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Recht auf Löschung</h3>
                <p>
                  Sie haben das Recht, zu verlangen, dass betreffende Daten unverzüglich gelöscht werden, und wir sind verpflichtet, personenbezogene
                  Daten unverzüglich zu löschen, sofern einer der gesetzlichen Gründe zutrifft.
                </p>
              </div>

              <div>
                <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Beschwerderecht bei der Aufsichtsbehörde</h3>
                <p>
                  Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung Ihrer personenbezogenen Daten zu beschweren.
                </p>
              </div>
            </div>
          </div>

          <!-- Social Media & Externe Links -->
          <div>
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">4. Social Media & Externe Links</h2>
            <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              <p>
                Unsere Website kann Links zu externen Webseiten Dritter enthalten. Auf die Inhalte dieser Webseiten haben wir keinen Einfluss. Deshalb
                können wir für diese fremden Inhalte auch keine Gewähr übernehmen.
              </p>
              <p>
                Bei Nutzung von Social-Media-Plugins oder Links zu sozialen Netzwerken können personenbezogene Daten an die jeweiligen Anbieter
                übertragen werden. Wir weisen darauf hin, dass wir als Anbieter der Seiten keine Kenntnis vom Inhalt der übermittelten Daten sowie
                deren Nutzung durch die Drittanbieter erhalten.
              </p>
              <p>
                Für weitere Informationen zur Datenverarbeitung durch Drittanbieter beachten Sie bitte die jeweiligen Datenschutzerklärungen der
                entsprechenden Anbieter.
              </p>
            </div>
          </div>

          <!-- Änderungen -->
          <div class="border-t border-vsg-blue-100 pt-12">
            <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">5. Änderungen dieser Datenschutzerklärung</h2>
            <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
              Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
