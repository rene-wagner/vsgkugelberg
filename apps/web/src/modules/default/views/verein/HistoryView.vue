<script setup lang="ts">
import {
  VsgFactCard,
  VsgTimeline,
  VsgChart,
  VsgAccordion,
  VsgSuccessList,
} from '@/shared/components';
import CtaSection from '../../components/CtaSection.vue';

// --- Data Constants (To be replaced by API calls later) ---

const CTA_DATA = {
  title: 'Werde Teil unserer Geschichte',
  primaryButtonText: 'MITGLIED WERDEN',
  primaryButtonLink: '/verein/mitgliedschaft',
  theme: 'white' as const,
};

const FOUNDING_DATA = {
  title: 'WIE ALLES BEGANN',
  narrative: [
    'Zu Beginn der 1980er Jahre entstand in Weißenfels das Wohngebiet „Kugelberg“. Es war eine Zeit des Aufbruchs und der sportlichen Begeisterung. Die Gründungsmitglieder der VSG waren überwiegend dort wohnhaft – so lag es nahe, den Namen des Viertels als Grundlage zur Namensgebung zu wählen.',
    'Als erste Sportstätte wurde die Turnhalle der 1983 eingeweihten Fritz-Juch-Oberschule, die heute als Ökowegschule bekannt ist, vom Verein genutzt. Hier wurden die ersten Weichen für eine Gemeinschaft gestellt, die heute weit über die Grenzen von Weißenfels hinaus bekannt ist.',
  ],
  facts: [
    { label: 'Name', value: 'VSG „Fortschritt“ Kugelberg' },
    { label: 'Gründung', value: '10. Mai 1985' },
    { label: 'Ort', value: 'Weißenfels, Kugelbergring 16' },
    { label: 'Vorstand (1985)', value: 'Friedemann Lange' },
  ],
};

const MILESTONES = [
  {
    year: '1985',
    title: 'Gründung der Sektionen',
    description:
      'Start mit Volleyball (Claus Brenner), Pop-Gymnastik (Heike Hofmann) und Tischtennis (Hans-Werner Rust).',
  },
  {
    year: '1990',
    title: 'Neugründung als VSG Kugelberg e.V.',
    description:
      'Auflösung der alten Struktur am 13.12. und Neugründung unter heutigem Namen am 14.12.1990.',
  },
  {
    year: '1992',
    title: 'Wachstum durch Anschluss',
    description:
      'Abteilung Tischtennis des 1. SC 1861 Weißenfels schließt sich am 19.06. an.',
  },
  {
    year: '2012',
    title: 'Badminton-Expansion',
    description:
      'Anschluss der Abt. Badminton von Lok Weißenfels mit 46 neuen Mitgliedern am 01.07.2012.',
  },
];

const MEMBERSHIP_DATA = {
  labels: ['2000', '2005', '2010', '2015', '2020', '2022'],
  datasets: [
    {
      label: 'Mitglieder',
      data: [111, 96, 106, 223, 200, 210],
      borderColor: '#d4a91a',
      backgroundColor: 'rgba(212, 169, 26, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#d4a91a',
      pointBorderColor: '#ffffff',
      pointRadius: 6,
      pointHoverRadius: 8,
    },
  ],
};

const CHRONICLE_GROUPS = [
  {
    id: 1,
    title: '1990 – 2000: Die Anfänge & Erste Jubiläen',
    content: [
      {
        year: '1994:',
        text: 'Ehrennadel des Landessportbundes in Silber für Jürgen Flister und Walter Reichert.',
      },
      {
        year: '1995:',
        text: '10-jähriges Bestehen im Hotel „Schöne Aussicht“ mit 110 Teilnehmern. Erstmalige Ernennung von Ehrenmitgliedern.',
      },
      {
        year: '1990-06:',
        text: 'Heidi Lange prägt den Verein als Vorstandsvorsitzende over 17 Jahre.',
      },
    ],
  },
  {
    id: 2,
    title: '2001 – 2010: Digitalisierung & Sportbund',
    content: [
      {
        year: '2007:',
        text: 'Beitritt zum Kreissportbund Burgenlandkreis. Neugestaltung der Homepage und des Vereinslogos.',
      },
      {
        year: '2010:',
        text: '25-jähriges Jubiläum im Bootshaus. Teilnahme am Sachsen-Anhalt Tag in Weißenfels.',
      },
    ],
  },
  {
    id: 3,
    title: '2011 – 2019: Auszeichnungen & Erfolge',
    content: [
      {
        year: '2013-15:',
        text: 'Mehrfache Homepage-Relaunches. Rosa Beck und Hans-Werner Rust erhalten LSB-Ehrennadel in Silber.',
      },
      {
        year: '2017:',
        text: 'Heidrun Hauser wird Sportlerin des Jahres im Burgenlandkreis (12.115 Stimmen).',
      },
      {
        year: '2019:',
        text: 'Tischtennis-Herrenmannschaft belegt 3. Platz bei der Sportlerwahl – vor dem MBC!',
      },
    ],
  },
  {
    id: 4,
    title: '2020 – 2022: Pandemie & Neuanfang',
    content: [
      {
        year: '2020:',
        text: 'Corona-Pandemie: Erste Schließung am 13.03.2020. Wiedereröffnung im Juni/Juli unter strengen Auflagen.',
      },
      {
        year: '2022:',
        text: 'Rückkehr in die Albert-Einstein-Halle nach zweijähriger Sanierung am 01.02.2022.',
      },
    ],
  },
];

const FESTIVAL_CARDS = [
  {
    emoji: '🎢',
    title: 'ALLWETTERRODELBAHN',
    subtitle: 'Regelmäßiges Highlight (seit 2010)',
    text: 'Ein Dauerbrenner für Jung und Alt. Bis zu 53 Teilnehmer (2020) jagen jährlich durch die Kurven und messen sich beim Minigolf.',
    icon: 'smile',
  },
  {
    emoji: '🚲',
    title: 'RADTOUREN',
    subtitle: 'Saale-Radwanderweg',
    text: 'Ob zum Halleschen Anger oder Richtung Uichteritz – unsere Radtouren stärken den Zusammenhalt auch abseits der Sporthallen.',
    icon: 'bicycle',
  },
  {
    emoji: '🚢',
    title: 'KULTUR & AUSFLÜGE',
    subtitle: 'Traumschiff & Geschichte',
    text: 'Traumschiff-Fahrten, Besuche des Gosecker Schlosses oder Bowlingabende sorgen für Abwechslung und gute Laune im Vereinskalender.',
    icon: 'ship',
  },
];

const ACHIEVEMENT_CATEGORIES = [
  { id: 'badminton', label: 'BADMINTON' },
  { id: 'tt', label: 'TISCHTENNIS' },
  { id: 'volleyball', label: 'VOLLEYBALL' },
];

const ACHIEVEMENT_ITEMS = [
  {
    year: '2013',
    category: 'badminton',
    categoryLabel: 'Badminton',
    title: 'Deutsche Meisterschaften Berlin',
    description: 'Heidrun Hauser belegt im Einzel und Doppel den 3. Platz.',
    colorClass: 'border-vsg-gold-500',
  },
  {
    year: '2014',
    category: 'badminton',
    categoryLabel: 'Badminton',
    title: 'Norddeutsche Meisterschaften',
    description:
      'Helmut Wiegand wird 1. im Doppel. Heidrun Hauser wird Deutsche Vizemeisterin im Doppel.',
    colorClass: 'border-vsg-gold-500',
  },
  {
    year: '2013',
    category: 'tt',
    categoryLabel: 'Tischtennis',
    title: 'Landespokalsieg Klasse B',
    description:
      'Andreas & Matthias Fekl sowie Marco Merten gewinnen den Landespokal in Riestedt.',
    colorClass: 'border-vsg-blue-400',
  },
  {
    year: '2015',
    category: 'tt',
    categoryLabel: 'Tischtennis',
    title: 'Landespokalsieg Klasse A',
    description:
      'Erster Sieg in der Königsklasse durch Andreas & Johannes Fekl sowie André Kreisel.',
    colorClass: 'border-vsg-blue-400',
  },
  {
    year: '2018',
    category: 'tt',
    categoryLabel: 'Tischtennis',
    title: 'Aufstieg Verbandsliga',
    description:
      'Erstmaliger Aufstieg der 1. Herrenmannschaft in die höchste Spielklasse des Landes.',
    colorClass: 'border-vsg-blue-400',
  },
  {
    year: '2012',
    category: 'volleyball',
    categoryLabel: 'Beachvolleyball',
    title: 'Landesmeister Ü53',
    description: 'Lars Hoffmann und Jörg Schmeißer gewinnen den Titel in Halle-Neustadt.',
    colorClass: 'border-vsg-blue-600',
  },
  {
    year: '2018',
    category: 'volleyball',
    categoryLabel: 'Beachvolleyball',
    title: 'Nordostdeutscher Meister',
    description: 'Titelgewinn für Hoffmann/Schmeißer in der Altersklasse Ü59.',
    colorClass: 'border-vsg-blue-600',
  },
];
</script>

<template>
  <div
    class="min-h-screen text-white overflow-x-hidden selection:bg-vsg-gold-500 selection:text-vsg-blue-900"
  >
    <!-- Hero Section -->
    <header class="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
      <!-- Background gradient overlay -->
      <div
        class="absolute inset-0 bg-gradient-to-br from-vsg-blue-900 via-vsg-blue-800/50 to-transparent"
      ></div>

      <!-- Decorative elements -->
      <div class="absolute top-1/4 right-0 w-96 h-96 bg-vsg-gold-500/10 rounded-full blur-3xl"></div>
      <div class="absolute bottom-1/4 left-0 w-80 h-80 bg-vsg-blue-500/20 rounded-full blur-3xl"></div>

      <div class="relative z-10 text-center px-6 max-w-4xl animate-fadeIn">
        <span
          class="inline-block font-body text-sm tracking-[0.6em] text-vsg-gold-400 uppercase mb-4 border border-vsg-gold-500/30 px-6 py-2"
        >
          Tradition seit 1985
        </span>
        <h1
          class="font-display text-7xl md:text-9xl lg:text-[12rem] text-white tracking-tight leading-none mb-6 text-glow"
        >
          DIE CHRONIK
        </h1>
        <p class="font-body text-vsg-blue-200 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
          Von den ersten Aufschlägen in der Fritz-Juch-Oberschule bis hin zu Erfolgen auf
          internationaler Bühne – begleiten Sie uns auf einer Zeitreise durch die Geschichte der VSG
          Kugelberg.
        </p>
      </div>

      <!-- Scroll indicator -->
      <div class="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce z-20">
        <svg class="w-8 h-8 text-vsg-gold-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          ></path>
        </svg>
      </div>
    </header>

    <!-- Section: Founding (White Background) -->
    <section id="founding" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="grid lg:grid-cols-2 gap-16 items-start">
          <!-- Narrative Text -->
          <div class="space-y-8 animate-fadeIn">
            <div class="flex items-center gap-4">
              <div class="h-px w-12 bg-vsg-gold-600"></div>
              <span class="font-display text-vsg-gold-600 text-2xl tracking-widest uppercase"
                >Der Ursprung</span
              >
            </div>
            <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900">
              {{ FOUNDING_DATA.title }}
            </h2>
            <div class="font-body text-gray-600 text-lg leading-relaxed space-y-6">
              <p v-for="(p, index) in FOUNDING_DATA.narrative" :key="index">
                {{ p }}
              </p>
            </div>

            <VsgFactCard title="DIE ECKDATEN" :facts="FOUNDING_DATA.facts" />
          </div>

          <!-- Timeline -->
          <VsgTimeline title="MEILENSTEINE & FUSIONEN" :items="MILESTONES" />
        </div>
      </div>
    </section>

    <!-- Section: Development (Chart & Chronicle) (Light Gray Background) -->
    <section id="development" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 mb-4">
            ENTWICKLUNG & WACHSTUM
          </h2>
          <p class="font-body text-gray-600 max-w-2xl mx-auto text-lg">
            Vom kleinen Kiez-Verein zur festen Größe im Burgenlandkreis. Die Zahlen sprechen für
            sich.
          </p>
        </div>

        <!-- Chart -->
        <div class="bg-white p-8 rounded-xl border border-gray-200 mb-20 shadow-sm">
          <div class="flex justify-between items-center mb-8">
            <h3 class="font-display text-2xl text-vsg-gold-600 uppercase tracking-widest">
              Mitgliederstatistik
            </h3>
            <div class="flex items-center gap-4 text-xs uppercase tracking-tighter text-vsg-blue-600">
              <span class="flex items-center gap-1"
                ><div class="w-3 h-3 bg-vsg-gold-500 rounded-full"></div>
                Mitgliederzahl</span
              >
            </div>
          </div>
          <div class="h-[400px] w-full">
            <VsgChart :data="MEMBERSHIP_DATA" />
          </div>
        </div>

        <!-- Chronicle Accordion -->
        <div class="max-w-4xl mx-auto space-y-4">
          <h3 class="font-display text-3xl text-vsg-blue-900 mb-8 text-center uppercase tracking-widest">
            Chronik der Ereignisse
          </h3>
          <VsgAccordion :items="CHRONICLE_GROUPS" />
        </div>
      </div>
    </section>

    <!-- Section: Festivals (White Background) -->
    <section id="festivals" class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="font-display text-vsg-gold-600 text-2xl tracking-[0.2em] uppercase"
            >Vereinsleben</span
          >
          <h2 class="font-display text-5xl md:text-6xl text-vsg-blue-900 mt-2">GEMEINSAM AKTIV</h2>
          <p class="font-body text-gray-600 mt-4 max-w-2xl mx-auto text-lg">
            Sport ist nur die halbe Miete. Bei uns wird Gemeinschaft großgeschrieben – ob auf dem
            Rad, dem Schiff oder der Rodelbahn.
          </p>
        </div>

        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div
            v-for="card in FESTIVAL_CARDS"
            :key="card.title"
            class="bg-gray-50 border border-gray-200 p-8 hover:bg-gray-100 transition-all group overflow-hidden relative shadow-sm"
          >
            <div
              class="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-500"
            >
              <span class="text-7xl">{{ card.emoji }}</span>
            </div>
            <span class="font-display text-4xl text-vsg-gold-600 block mb-2">{{ card.emoji }}</span>
            <h4 class="font-display text-2xl text-vsg-blue-900 tracking-widest">{{ card.title }}</h4>
            <p class="text-sm text-vsg-blue-600 mt-1 uppercase tracking-tighter italic">
              {{ card.subtitle }}
            </p>
            <p class="font-body text-base text-gray-600 mt-4 leading-relaxed">
              {{ card.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Section: Achievements (Hall of Fame) (Light Gray Background) -->
    <section id="achievements" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-6">
        <div class="text-center mb-16">
          <span class="font-display text-vsg-gold-600 text-2xl tracking-[0.2em] uppercase"
            >Unsere Stolz</span
          >
          <h2 class="font-display text-5xl md:text-7xl text-vsg-blue-900 mt-2">HALL OF FAME</h2>
        </div>

        <!-- Highlight Box (Gold) -->
        <div
          class="max-w-4xl mx-auto mb-20 bg-gradient-to-br from-vsg-gold-600 to-vsg-gold-400 p-1 rounded-2xl shadow-xl animate-pulse-gold"
        >
          <div class="bg-white rounded-2xl p-10 text-center">
            <span class="font-display text-vsg-gold-600 text-2xl tracking-widest block mb-4"
              >★ WELT- & EUROPAMEISTERSCHAFTEN ★</span
            >
            <h3 class="font-display text-4xl md:text-6xl text-vsg-blue-900 mb-6">
              BRONZE BEI DER WELTMEISTERSCHAFT
            </h3>
            <p class="font-body text-gray-600 text-lg leading-relaxed max-w-2xl mx-auto">
              Helmut Wiegand und Dietmar Unser gewinnen 2015 die Bronzemedaille im Badminton-Doppel
              in Helsingborg. Ein Jahr später sichert sich Helmut Wiegand die Silbermedaille im
              Doppel bei der Europameisterschaft in Slowenien.
            </p>
            <div class="flex flex-wrap justify-center gap-4 mt-8">
              <span
                class="bg-vsg-gold-500 text-vsg-blue-900 px-4 py-1 rounded text-sm font-bold uppercase tracking-widest shadow-sm"
                >Helmut Wiegand</span
              >
              <span
                class="bg-vsg-gold-500 text-vsg-blue-900 px-4 py-1 rounded text-sm font-bold uppercase tracking-widest shadow-sm"
                >Heidrun Hauser</span
              >
            </div>
          </div>
        </div>

        <VsgSuccessList :items="ACHIEVEMENT_ITEMS" :categories="ACHIEVEMENT_CATEGORIES" />
      </div>
    </section>

    <!-- CTA Section -->
    <CtaSection v-bind="CTA_DATA" theme="gold" />
  </div>
</template>

<style scoped>
.text-glow {
  text-shadow: 0 0 30px rgba(252, 211, 77, 0.4);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes pulse-gold {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(252, 211, 77, 0.4);
  }
  50% {
    box-shadow: 0 0 40px rgba(252, 211, 77, 0.8);
  }
}

.animate-pulse-gold {
  animation: pulse-gold 2s ease-in-out infinite;
}
</style>
