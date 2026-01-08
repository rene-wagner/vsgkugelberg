import { prisma } from '../lib/prisma.lib';

async function main() {
  const historyData = {
    heroHeadline: 'DIE CHRONIK',
    heroSubHeadline:
      'Von den ersten Aufschlägen in der Fritz-Juch-Oberschule bis hin zu Erfolgen auf internationaler Bühne – begleiten Sie uns auf einer Zeitreise durch die Geschichte der VSG Kugelberg.',

    foundingHeadline: 'WIE ALLES BEGANN',
    foundingNarrative: [
      'Zu Beginn der 1980er Jahre entstand in Weißenfels das Wohngebiet „Kugelberg“. Es war eine Zeit des Aufbruchs und der sportlichen Begeisterung. Die Gründungsmitglieder der VSG waren überwiegend dort wohnhaft – so lag es nahe, den Namen des Viertels als Grundlage zur Namensgebung zu wählen.',
      'Als erste Sportstätte wurde die Turnhalle der 1983 eingeweihten Fritz-Juch-Oberschule, die heute als Ökowegschule bekannt ist, vom Verein genutzt. Hier wurden die ersten Weichen für eine Gemeinschaft gestellt, die heute weit über die Grenzen von Weißenfels hinaus bekannt ist.',
    ],
    foundingFactCardHeadline: 'DIE ECKDATEN',
    foundingFacts: [
      { label: 'Name', value: 'VSG „Fortschritt“ Kugelberg' },
      { label: 'Gründung', value: '10. Mai 1985' },
      { label: 'Ort', value: 'Weißenfels, Kugelbergring 16' },
      { label: 'Vorstand (1985)', value: 'Friedemann Lange' },
    ],
    foundingMilestonesHeadline: 'MEILENSTEINE & FUSIONEN',
    foundingMilestones: [
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
    ],

    developmentHeadline: 'ENTWICKLUNG & WACHSTUM',
    developmentNarrative: [
      'Vom kleinen Kiez-Verein zur festen Größe im Burgenlandkreis. Die Zahlen sprechen für sich.',
    ],
    developmentChartData: {
      labels: ['2000', '2005', '2010', '2015', '2020', '2022'],
      datasets: [
        {
          label: 'Mitglieder',
          data: [111, 96, 106, 223, 200, 210],
        },
      ],
    },
    developmentChronicleGroups: [
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
    ],

    festivalsHeadline: 'GEMEINSAM AKTIV',
    festivalsDescription:
      'Sport ist nur die halbe Miete. Bei uns wird Gemeinschaft großgeschrieben – ob auf dem Rad, dem Schiff oder der Rodelbahn.',
    festivalsItems: [
      {
        title: 'ALLWETTERRODELBAHN',
        subtitle: 'Regelmäßiges Highlight (seit 2010)',
        text: 'Ein Dauerbrenner für Jung und Alt. Bis zu 53 Teilnehmer (2020) jagen jährlich durch die Kurven und messen sich beim Minigolf.',
        icon: 'smile',
      },
      {
        title: 'RADTOUREN',
        subtitle: 'Saale-Radwanderweg',
        text: 'Ob zum Halleschen Anger oder Richtung Uichteritz – unsere Radtouren stärken den Zusammenhalt auch abseits der Sporthallen.',
        icon: 'bicycle',
      },
      {
        title: 'KULTUR & AUSFLÜGE',
        subtitle: 'Traumschiff & Geschichte',
        text: 'Traumschiff-Fahrten, Besuche des Gosecker Schlosses oder Bowlingabende sorgen für Abwechslung und gute Laune im Vereinskalender.',
        icon: 'ship',
      },
    ],

    achievementsHeadline: 'HALL OF FAME',
    achievementsItems: [
      {
        year: '2013',
        category: 'badminton',
        title: 'Deutsche Meisterschaften Berlin',
        description: 'Heidrun Hauser belegt im Einzel und Doppel den 3. Platz.',
      },
      {
        year: '2014',
        category: 'badminton',
        title: 'Norddeutsche Meisterschaften',
        description:
          'Helmut Wiegand wird 1. im Doppel. Heidrun Hauser wird Deutsche Vizemeisterin im Doppel.',
      },
      {
        year: '2013',
        category: 'table-tennis',
        title: 'Landespokalsieg Klasse B',
        description:
          'Andreas & Matthias Fekl sowie Marco Merten gewinnen den Landespokal in Riestedt.',
      },
      {
        year: '2015',
        category: 'table-tennis',
        title: 'Landespokalsieg Klasse A',
        description:
          'Erster Sieg in der Königsklasse durch Andreas & Johannes Fekl sowie André Kreisel.',
      },
      {
        year: '2018',
        category: 'table-tennis',
        title: 'Aufstieg Verbandsliga',
        description:
          'Erstmaliger Aufstieg der 1. Herrenmannschaft in die höchste Spielklasse des Landes.',
      },
      {
        year: '2012',
        category: 'volleyball',
        title: 'Landesmeister Ü53',
        description:
          'Lars Hoffmann und Jörg Schmeißer gewinnen den Titel in Halle-Neustadt.',
      },
      {
        year: '2018',
        category: 'volleyball',
        title: 'Nordostdeutscher Meister',
        description:
          'Titelgewinn für Hoffmann/Schmeißer in der Altersklasse Ü59.',
      },
    ],

    ctaHeadline: 'Werde Teil unserer Geschichte',
    ctaDescription:
      'Schließe dich unserer Gemeinschaft an und schreibe das nächste Kapitel mit uns.',
  };

  console.log('Seeding history content...');

  await prisma.historyContent.upsert({
    where: { id: 1 },
    update: historyData,
    create: {
      id: 1,
      ...historyData,
    },
  });

  console.log('History content seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
