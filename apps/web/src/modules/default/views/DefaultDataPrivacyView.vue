<script setup lang="ts">
import VsgHeroSection from '../components/VsgHeroSection.vue';
import VsgContentSection from '../components/VsgContentSection.vue';

// Static privacy policy page - no reactive state needed
</script>

<template>
  <div class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900">
    <VsgHeroSection
      headline="DATENSCHUTZ"
      description="Datenschutzerklärung gemäß DSGVO"
      min-height="70vh"
    />

    <VsgContentSection>
      <div class="space-y-12">
        <!-- 1. Verantwortliche Stelle -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">1. Verantwortliche Stelle</h2>
          <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            <p>Verantwortlich für die Datenverarbeitung auf dieser Website ist:</p>
            <p>
              VSG Kugelberg e.V.<br />
              Thomas-Müntzer-Str. 28<br />
              06667 Weißenfels
            </p>
            <p>
              <strong class="text-vsg-blue-900">E-Mail:</strong>
              <a
                href="mailto:christian.koehler@vsg-kugelberg.de"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                christian.koehler@vsg-kugelberg.de </a
              ><br />
              <strong class="text-vsg-blue-900">Telefon:</strong> 0171 6905088
            </p>
          </div>
        </div>

        <!-- 2. Personenbezogene Daten -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">2. Personenbezogene Daten</h2>
          <div class="mt-4 space-y-6 font-body text-lg leading-relaxed text-vsg-blue-700">
            <div>
              <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Allgemeine Nutzung der Website</h3>
              <p>
                Sie können unsere Webseite ohne Angabe personenbezogener Daten besuchen. Soweit auf unseren Seiten personenbezogene Daten (wie Name,
                Anschrift oder E-Mail-Adresse) erhoben werden, erfolgt dies, soweit möglich, auf freiwilliger Basis. Diese Daten werden ohne Ihre
                ausdrückliche Zustimmung nicht an Dritte weitergegeben.
              </p>
              <p class="mt-2">
                Sofern zwischen Ihnen und uns ein Vertragsverhältnis begründet, inhaltlich ausgestaltet oder geändert werden soll oder Sie an uns eine
                Anfrage stellen, erheben und verwenden wir personenbezogene Daten von Ihnen, soweit dies zu diesen Zwecken erforderlich ist
                (Bestandsdaten). Sämtliche personenbezogenen Daten werden nur solange gespeichert wie dies für den genannten Zweck (Bearbeitung Ihrer
                Anfrage oder Abwicklung eines Vertrags) erforderlich ist. Hierbei werden steuer- und handelsrechtliche Aufbewahrungsfristen
                berücksichtigt.
              </p>
              <p class="mt-2">
                Wir weisen ausdrücklich darauf hin, dass die Datenübertragung im Internet (z.B. bei der Kommunikation per E-Mail) Sicherheitslücken
                aufweisen kann und nicht lückenlos vor dem Zugriff durch Dritte geschützt werden kann. Die Verwendung der Kontaktdaten unseres
                Impressums zur gewerblichen Werbung ist ausdrücklich nicht erwünscht, es sei denn wir hatten zuvor unsere schriftliche Einwilligung
                erteilt oder es besteht bereits eine Geschäftsbeziehung.
              </p>
            </div>

            <div>
              <h3 class="mb-2 font-display text-xl text-vsg-blue-800">Vereinsmitglieder</h3>
              <p>
                Die Nutzung der dem Verein zur Verfügung gestellten personenbezogenen Daten der Vereinsmitglieder — wie Name, Vorname, Geburtsdatum,
                Anschrift, Kontoverbindung, Mailadresse und Telefonnummer sowie von Bildmaterial, welches im Rahmen von Vereinsveranstaltungen
                entstanden ist — erfolgt ausschließlich auf der Grundlage der Datenschutzgrundverordnung (DSGVO) und des Bundesdatenschutzgesetzes
                (BDSG).
              </p>
              <p class="mt-2">
                Diese Daten dienen der Erfüllung von Vereinspflichten auf Grundlage der Vereinssatzung (u.a. Einzug von Beiträgen, Mitteilung von
                Terminen für Vereinsveranstaltungen) und gegenüber behördlicher Institutionen wie dem Landessportbund, Kreissportbund, den
                Sportfachverbänden (Tischtennis, Volleyball, Gymnastik und Badminton), der Verwaltung des Landkreises und der Stadt Weißenfels sowie
                dem Finanzamt. Hier werden die Daten z.B. im Zusammenhang mit der Sportstättennutzung, der Höhe von Mitgliedsbeiträgen, der
                Beantragung und Abrechnung von Fördermitteln und der Abgabe der Körperschaftssteuererklärung benötigt. Sie dienen darüber hinaus,
                insbesondere in Bezug auf Inhalte unserer Homepage, als Kommunikationsmittel innerhalb und außerhalb des Vereins.
              </p>
              <p class="mt-2">
                Auf Anordnung der zuständigen Stellen dürfen wir im Einzelfall Auskunft über diese Daten (Bestandsdaten) erteilen, soweit dies für
                Zwecke der Strafverfolgung, zur Gefahrenabwehr, zur Erfüllung der gesetzlichen Aufgaben der Verfassungsschutzbehörden oder des
                Militärischen Abschirmdienstes oder zur Durchsetzung der Rechte am geistigen Eigentum erforderlich ist.
              </p>
            </div>
          </div>
        </div>

        <!-- 3. Rechte der Betroffenen -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">3. Rechte der Betroffenen</h2>
          <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            <p>Zu den Rechten der betroffenen Personen zählen gemäß DSGVO:</p>
            <ul class="list-inside list-disc space-y-2 pl-4">
              <li>Informationspflichten bei der Erhebung von personenbezogenen Daten (Art. 13 und 14 DSGVO)</li>
              <li>Auskunftsrecht (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Mitteilungspflicht in Bezug auf die Berichtigung, Löschung oder Einschränkung der Verarbeitung (Art. 19 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
            <p>Für die Ausübung und Nachfragen hinsichtlich dieser Rechte steht Ihnen der Ansprechpartner des Vereins gern zur Verfügung:</p>
            <p>
              Christian Köhler<br />
              <strong class="text-vsg-blue-900">E-Mail:</strong>
              <a
                href="mailto:christian.koehler@vsg-kugelberg.de"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                christian.koehler@vsg-kugelberg.de </a
              ><br />
              <strong class="text-vsg-blue-900">Telefon:</strong> 0171 6905088
            </p>
          </div>
        </div>

        <!-- 4. Google Analytics -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">4. Google Analytics</h2>
          <div class="mt-4 space-y-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            <p>
              Diese Website benutzt Google Analytics, einen Webanalysedienst der Google Inc. (Google). Google Analytics verwendet sog. Cookies,
              Textdateien, die auf Ihrem Computer gespeichert werden und die eine Analyse der Benutzung der Website durch Sie ermöglichen. Die durch
              den Cookie erzeugten Informationen über Ihre Benutzung dieser Website werden in der Regel an einen Server von Google in den USA
              übertragen und dort gespeichert.
            </p>
            <p>
              Wir haben die IP-Anonymisierung aktiviert. Auf dieser Webseite wird Ihre IP-Adresse von Google daher innerhalb von Mitgliedstaaten der
              Europäischen Union oder in anderen Vertragsstaaten des Abkommens über den Europäischen Wirtschaftsraum zuvor gekürzt. Nur in
              Ausnahmefällen wird die volle IP-Adresse an einen Server von Google in den USA übertragen und dort gekürzt. Im Auftrag des Betreibers
              dieser Website wird Google diese Informationen benutzen, um Ihre Nutzung der Website auszuwerten, um Reports über die Websiteaktivitäten
              zusammenzustellen und um weitere mit der Websitenutzung und der Internetnutzung verbundene Dienstleistungen gegenüber dem
              Websitebetreiber zu erbringen. Die im Rahmen von Google Analytics von Ihrem Browser übermittelte IP-Adresse wird nicht mit anderen Daten
              von Google zusammengeführt.
            </p>
            <p>
              Sie können die Speicherung der Cookies durch eine entsprechende Einstellung Ihrer Browser-Software verhindern; wir weisen Sie jedoch
              darauf hin, dass Sie in diesem Fall gegebenenfalls nicht sämtliche Funktionen dieser Website vollumfänglich werden nutzen können. Sie
              können darüber hinaus die Erfassung der durch das Cookie erzeugten und auf Ihre Nutzung der Website bezogenen Daten (inkl. Ihrer
              IP-Adresse) an Google sowie die Verarbeitung dieser Daten durch Google verhindern, indem Sie das unter dem folgenden Link verfügbare
              Browser-Plugin herunterladen und installieren:
              <a
                href="https://tools.google.com/dlpage/gaoptout?hl=de"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-vsg-gold-600 transition-colors break-all"
              >
                https://tools.google.com/dlpage/gaoptout?hl=de
              </a>
            </p>
          </div>
        </div>

        <!-- 5. Änderungen dieser Datenschutzerklärung -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">5. Änderungen dieser Datenschutzerklärung</h2>
          <p class="mt-4 font-body text-lg leading-relaxed text-vsg-blue-700">
            Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen Anforderungen entspricht oder um
            Änderungen unserer Leistungen umzusetzen. Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
          </p>
        </div>
      </div>
    </VsgContentSection>
  </div>
</template>
