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
        <!-- Allgemeine Informationen -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Allgemeine Informationen</h2>
          <div class="mt-4 space-y-1 font-body text-lg leading-relaxed text-vsg-blue-700">
            <p><strong class="text-vsg-blue-900">Rechtsform:</strong> eingetragener Verein (e.V.)</p>
            <p>VSG Kugelberg e.V.</p>
            <p>Thomas-Müntzer-Str. 28</p>
            <p>06667 Weißenfels</p>
          </div>
        </div>

        <!-- Kontakt -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Kontakt</h2>
          <div class="mt-4 space-y-1 font-body text-lg text-vsg-blue-700">
            <p><strong class="text-vsg-blue-900">Telefon:</strong> 03443 804386</p>
            <p><strong class="text-vsg-blue-900">Mobil:</strong> 0171 6905088</p>
            <p>
              <strong class="text-vsg-blue-900">E-Mail:</strong>
              <a
                href="mailto:christian.koehler@vsg-kugelberg.de"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                christian.koehler@vsg-kugelberg.de
              </a>
            </p>
            <p>
              <strong class="text-vsg-blue-900">Website:</strong>
              <a
                href="http://www.vsg-kugelberg.de"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                www.vsg-kugelberg.de
              </a>
            </p>
          </div>
        </div>

        <!-- Vertretungsberechtigte Person -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Vertretungsberechtigte Person</h2>
          <div class="mt-4 space-y-1 font-body text-lg text-vsg-blue-700">
            <p><strong class="text-vsg-blue-900">Name:</strong> Christian Köhler</p>
            <p>
              <strong class="text-vsg-blue-900">E-Mail:</strong>
              <a
                href="mailto:christian.koehler@vsg-kugelberg.de"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                christian.koehler@vsg-kugelberg.de
              </a>
            </p>
          </div>
        </div>

        <!-- Registergericht -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Registergericht</h2>
          <div class="mt-4 space-y-1 font-body text-lg text-vsg-blue-700">
            <p><strong class="text-vsg-blue-900">Registergericht:</strong> Registergericht Stendal</p>
            <p><strong class="text-vsg-blue-900">Registernummer:</strong> VR 48 147</p>
          </div>
        </div>

        <!-- Inhaltlich verantwortliche Person -->
        <div>
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Inhaltlich verantwortliche Person</h2>
          <p class="mt-2 font-body text-sm text-vsg-blue-500">gemäß § 55 Abs. 2 RStV</p>
          <div class="mt-4 space-y-1 font-body text-lg text-vsg-blue-700">
            <p><strong class="text-vsg-blue-900">Name:</strong> Christian Köhler</p>
            <p>
              <strong class="text-vsg-blue-900">E-Mail:</strong>
              <a
                href="mailto:christian.koehler@vsg-kugelberg.de"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                christian.koehler@vsg-kugelberg.de
              </a>
            </p>
            <p><strong class="text-vsg-blue-900">Telefon:</strong> 03443 804386</p>
            <p>
              <strong class="text-vsg-blue-900">Website:</strong>
              <a
                href="http://vsg-kugelberg.de"
                target="_blank"
                rel="noopener noreferrer"
                class="hover:text-vsg-gold-600 transition-colors"
              >
                vsg-kugelberg.de
              </a>
            </p>
          </div>
        </div>

        <!-- Haftungsausschluss -->
        <div class="border-t border-vsg-blue-100 pt-12">
          <h2 class="font-display text-2xl tracking-wider text-vsg-blue-900 md:text-3xl">Haftungsausschluss</h2>
          <div class="mt-4 space-y-6 font-body text-lg leading-relaxed text-vsg-blue-700">
            <div>
              <h3 class="mb-2 font-display text-xl text-vsg-blue-800">1. Inhalt des Onlineangebotes</h3>
              <p>
                Der Autor übernimmt keinerlei Gewähr für die Aktualität, Korrektheit, Vollständigkeit oder Qualität der bereitgestellten
                Informationen. Haftungsansprüche gegen den Autor, welche sich auf Schäden materieller oder ideeller Art beziehen, die durch die
                Nutzung oder Nichtnutzung der dargebotenen Informationen bzw. durch die Nutzung fehlerhafter und unvollständiger Informationen
                verursacht wurden, sind grundsätzlich ausgeschlossen, sofern seitens des Autors kein nachweislich vorsätzliches oder grob fahrlässiges
                Verschulden vorliegt. Alle Angebote sind freibleibend und unverbindlich. Der Autor behält es sich ausdrücklich vor, Teile der Seiten
                oder das gesamte Angebot ohne gesonderte Ankündigung zu verändern, zu ergänzen, zu löschen oder die Veröffentlichung zeitweise oder
                endgültig einzustellen.
              </p>
            </div>

            <div>
              <h3 class="mb-2 font-display text-xl text-vsg-blue-800">2. Verweise und Links</h3>
              <p>
                Bei direkten oder indirekten Verweisen auf fremde Webseiten (Hyperlinks), die außerhalb des Verantwortungsbereiches des Autors liegen,
                würde eine Haftungsverpflichtung ausschließlich in dem Fall in Kraft treten, in dem der Autor von den Inhalten Kenntnis hat und es ihm
                technisch möglich und zumutbar wäre, die Nutzung im Falle rechtswidriger Inhalte zu verhindern. Der Autor erklärt hiermit
                ausdrücklich, dass zum Zeitpunkt der Linksetzung keine illegalen Inhalte auf den zu verlinkenden Seiten erkennbar waren. Auf die
                aktuelle und zukünftige Gestaltung, die Inhalte oder die Urheberschaft der verlinkten/verknüpften Seiten hat der Autor keinerlei
                Einfluss. Deshalb distanziert er sich hiermit ausdrücklich von allen Inhalten aller verlinkten/verknüpften Seiten, die nach der
                Linksetzung verändert wurden. Diese Feststellung gilt für alle innerhalb des eigenen Internetangebotes gesetzten Links und Verweise
                sowie für Fremdeinträge in vom Autor eingerichteten Gästebüchern, Diskussionsforen, Linkverzeichnissen, Mailinglisten und in allen
                anderen Formen von Datenbanken, auf deren Inhalt externe Schreibzugriffe möglich sind. Für illegale, fehlerhafte oder unvollständige
                Inhalte und insbesondere für Schäden, die aus der Nutzung oder Nichtnutzung solcherart dargebotener Informationen entstehen, haftet
                allein der Anbieter der Seite, auf welche verwiesen wurde, nicht derjenige, der über Links auf die jeweilige Veröffentlichung
                lediglich verweist.
              </p>
            </div>

            <div>
              <h3 class="mb-2 font-display text-xl text-vsg-blue-800">3. Urheber- und Kennzeichenrecht</h3>
              <p>
                Der Autor ist bestrebt, in allen Publikationen die Urheberrechte der verwendeten Bilder, Grafiken, Tondokumente, Videosequenzen und
                Texte zu beachten, von ihm selbst erstellte Bilder, Grafiken, Tondokumente, Videosequenzen und Texte zu nutzen oder auf lizenzfreie
                Grafiken, Tondokumente, Videosequenzen und Texte zurückzugreifen. Alle innerhalb des Internetangebotes genannten und ggf. durch Dritte
                geschützten Marken- und Warenzeichen unterliegen uneingeschränkt den Bestimmungen des jeweils gültigen Kennzeichenrechts und den
                Besitzrechten der jeweiligen eingetragenen Eigentümer. Allein aufgrund der bloßen Nennung ist nicht der Schluss zu ziehen, dass
                Markenzeichen nicht durch Rechte Dritter geschützt sind! Das Copyright für veröffentlichte, vom Autor selbst erstellte Objekte bleibt
                allein beim Autor der Seiten. Eine Vervielfältigung oder Verwendung solcher Grafiken, Tondokumente, Videosequenzen und Texte in
                anderen elektronischen oder gedruckten Publikationen ist ohne ausdrückliche Zustimmung des Autors nicht gestattet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </VsgContentSection>
  </div>
</template>
