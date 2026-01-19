// MySQL to PostgreSQL Migration Tool
// This tool migrates data from a MySQL database to a PostgreSQL database
// Run with: pnpm --filter migrate-mysql-to-postgres migrate

import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'fast-csv';
import mysql from 'mysql2/promise';
import pg from 'pg';
import slugify from 'slugify';

// Types
interface JoomlaCategory {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  parentId: number | null;
  createdAt: Date;
  updatedAt: Date;
}

interface JoomlaPost {
  id: number;
  title: string;
  content: string | null;
  catid: number;
  hits: number;
  created: Date;
  modified: Date;
  oldPost: number;
  authorId: number;
  published: number;
}

type CategoryMap = Map<number, number>;

interface SeedUser {
  username: string;
  email: string;
  password: string;
}

interface SeedDepartment {
  name: string;
  slug: string;
  shortDescription: string;
}

interface SeedDepartmentStat {
  label: string;
  value: string;
  sort: number;
}

interface SeedDepartmentLocation {
  name: string;
  badge: string;
  badgeVariant: 'primary' | 'secondary';
  street: string;
  city: string;
  mapsUrl: string;
  amenities: { text: string }[];
  sort: number;
}

interface SeedTrainingSession {
  day: string;
  time: string;
  locationName: string;
  sort: number;
}

interface SeedTrainingGroup {
  name: string;
  ageRange: string | null;
  icon: 'youth' | 'adults';
  variant: 'primary' | 'secondary';
  sort: number;
  sessions: SeedTrainingSession[];
}

interface CompleteDepartmentData {
  name: string;
  slug: string;
  shortDescription: string;
  stats: SeedDepartmentStat[];
  locations: SeedDepartmentLocation[];
  trainingGroups: SeedTrainingGroup[];
}

type DepartmentMap = Map<string, number>;
type LocationMap = Map<string, Map<string, number>>;
type TrainingGroupMap = Map<string, Map<string, number>>;

interface HistoryFact {
  year: string;
  headline: string;
  description: string;
}

interface HistoryMilestone {
  year: string;
  headline: string;
  description: string;
}

interface HistoryChartDataset {
  label: string;
  data: number[];
}

interface HistoryChartData {
  labels: string[];
  datasets: HistoryChartDataset[];
}

interface HistoryChronicleEntry {
  year: string;
  description: string;
}

interface HistoryChronicleGroup {
  headline: string;
  content: HistoryChronicleEntry[];
}

interface HistoryFestivalItem {
  headline: string;
  text: string;
}

interface HistoryAchievement {
  year: string;
  headline: string;
  description: string;
  category: string;
}

interface SeedHistory {
  heroHeadline: string;
  heroSubHeadline: string;
  foundingHeadline: string;
  foundingDescription: string;
  foundingFactCardHeadline: string;
  foundingFacts: HistoryFact[];
  foundingMilestonesHeadline: string;
  foundingMilestones: HistoryMilestone[];
  developmentHeadline: string;
  developmentDescription: string;
  developmentChartData: HistoryChartData;
  developmentChronicleGroups: HistoryChronicleGroup[];
  festivalsHeadline: string;
  festivalsDescription: string;
  festivalsItems: HistoryFestivalItem[];
  achievementsHeadline: string;
  achievementsItems: HistoryAchievement[];
  ctaHeadline: string;
  ctaDescription: string;
}

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface ContactPersonCsvRow {
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  address: string;
  phone: string;
}

interface ContactPersonSeedRow {
  firstName: string;
  lastName: string;
  type: string;
  email: string;
  address: string | null;
  phone: string;
  rowNumber: number;
}

const CONTACT_PERSON_HEADERS = ['firstName', 'lastName', 'type', 'email', 'address', 'phone'] as const;
const CSV_FILE_NAME = 'ContactPersons.csv';
const PLACEHOLDER_EMAIL_DOMAIN = 'vsg-kugelberg.de';

// Configuration
const getDbConfig = (prefix: 'MYSQL' | 'POSTGRES'): DbConfig => {
  const defaultPort = prefix === 'MYSQL' ? 3306 : 5432;

  const config: DbConfig = {
    host: process.env[`${prefix}_HOST`] || '',
    port: parseInt(process.env[`${prefix}_PORT`] || String(defaultPort)),
    user: process.env[`${prefix}_USER`] || '',
    password: process.env[`${prefix}_PASSWORD`] || '',
    database: process.env[`${prefix}_DATABASE`] || '',
  };

  const missingVars = Object.entries(config)
    .filter(([key, value]) => key !== 'port' && !value)
    .map(([key]) => `${prefix}_${key.toUpperCase()}`);

  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  return config;
};

// Database connections (single connections, not pools - this is a one-time script)
const createMySqlConnection = async (config: DbConfig): Promise<mysql.Connection> => {
  console.log(`Connecting to MySQL at ${config.host}:${config.port}...`);
  const connection = await mysql.createConnection(config);
  console.log('Connected to MySQL');
  return connection;
};

const createPostgresClient = async (config: DbConfig): Promise<pg.Client> => {
  console.log(`Connecting to PostgreSQL at ${config.host}:${config.port}...`);
  const client = new pg.Client(config);
  await client.connect();
  console.log('Connected to PostgreSQL');
  return client;
};

// Queries
const CATEGORY_QUERY = `
  SELECT
    id,
    title as name,
    path as slug,
    description,
    NULLIF(parent_id, 1) as parentId,
    NOW() as createdAt,
    NOW() as updatedAt
  FROM j3x_categories
  WHERE extension = 'com_content'
    AND published = 1
  ORDER BY lft ASC
  LIMIT 300
`;

const POST_QUERY = `
  SELECT
    id,
    title,
    introtext AS content,
    catid,
    hits,
    created,
    modified,
    1 AS oldPost,
    2 AS authorId,
    1 AS published
  FROM j3x_content
  WHERE catid = ?
    AND state = 1
    AND id NOT IN (26, 42, 123, 860, 869, 902, 903, 940, 1014, 1086, 1095)
  LIMIT 10000
`;

// Seed data
const SEED_USERS: SeedUser[] = [
  {
    username: 'john.doe',
    email: 'john.doe@example.com',
    password: '$2b$10$3reoOhi62GQ8qJenfs82BeSLLFm/MCuxj3zEZ/mgezRNN6YWA1krq',
  },
  {
    username: 'jane.doe',
    email: 'jane.doe@example.com',
    password: '$2b$10$3reoOhi62GQ8qJenfs82BeSLLFm/MCuxj3zEZ/mgezRNN6YWA1krq',
  },
];

const SEED_DEPARTMENT_DATA: CompleteDepartmentData[] = [
  {
    name: 'Badminton',
    slug: 'badminton',
    shortDescription:
      'Schnelle Ballwechsel und blitzschnelle Reaktionen! Badminton ist der perfekte Sport, um sich richtig auszupowern. Egal ob im Einzel oder Doppel – hier sind Geschwindigkeit und Taktik gefragt.',
    stats: [
      { label: 'Aktive Mitglieder', value: '30', sort: 0 },
      { label: 'Mannschaften', value: '4', sort: 1 },
      { label: 'Federbälle', value: '203', sort: 2 },
      { label: 'WM Bronzemedalien', value: '1', sort: 3 },
    ],
    locations: [
      {
        name: 'Schlossgartenturnhalle',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Zeitzer Str. 23b',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.199262/11.979805',
        amenities: [],
        sort: 0,
      },
      {
        name: 'Sporthalle Beuditzschule',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Beuditzstr. 41',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.200344/11.960836',
        amenities: [],
        sort: 1,
      },
    ],
    trainingGroups: [
      {
        name: 'Kinder & Jugend',
        ageRange: '6 - 17',
        icon: 'youth',
        variant: 'secondary',
        sort: 0,
        sessions: [
          {
            day: 'Freitag',
            time: '17:00 - 19:00',
            locationName: 'Schlossgartenturnhalle',
            sort: 0,
          },
        ],
      },
      {
        name: 'Erwachsene',
        ageRange: null,
        icon: 'adults',
        variant: 'primary',
        sort: 1,
        sessions: [
          {
            day: 'Dienstag',
            time: '18:00 - 20:00',
            locationName: 'Schlossgartenturnhalle',
            sort: 0,
          },
          {
            day: 'Mittwoch',
            time: '19:00 - 22:00',
            locationName: 'Sporthalle Beuditzschule',
            sort: 1,
          },
          {
            day: 'Freitag',
            time: '19:00 - 21:45',
            locationName: 'Schlossgartenturnhalle',
            sort: 2,
          },
        ],
      },
    ],
  },
  {
    name: 'Gymnastik',
    slug: 'gymnastik',
    shortDescription:
      'Fit von Kopf bis Fuß! Mit abwechslungsreichen Übungen kräftigen wir die Muskulatur und halten die Gelenke geschmeidig. Ein effektives Ganzkörpertraining für jede Altersgruppe.',
    stats: [
      { label: 'Aktive Mitglieder', value: '30', sort: 0 },
      { label: 'Mannschaften', value: '4', sort: 1 },
      { label: 'Joga-Matten', value: '203', sort: 2 },
      { label: 'Irgendwas', value: '5', sort: 3 },
    ],
    locations: [
      {
        name: 'Sporthalle Ökowegschule',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Kugelbergring 32',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.192598/11.980410',
        amenities: [],
        sort: 0,
      },
    ],
    trainingGroups: [
      {
        name: 'Erwachsene',
        ageRange: null,
        icon: 'adults',
        variant: 'primary',
        sort: 0,
        sessions: [
          {
            day: 'Mittwoch',
            time: '19:30 - 20:45',
            locationName: 'Sporthalle Ökowegschule',
            sort: 0,
          },
        ],
      },
    ],
  },
  {
    name: 'Tischtennis',
    slug: 'tischtennis',
    shortDescription:
      'Reaktionsschnelligkeit und Ballgefühl auf kleinstem Raum. Tischtennis ist das schnellste Rückschlagspiel der Welt und macht einfach riesigen Spaß – egal ob Anfänger oder Fortgeschrittener.',
    stats: [
      { label: 'Aktive Mitglieder', value: '30', sort: 0 },
      { label: 'Mannschaften', value: '6', sort: 1 },
      { label: 'Tischtennisplatten', value: '203', sort: 2 },
      { label: 'Irgendwas', value: '5', sort: 3 },
    ],
    locations: [
      {
        name: 'Sporthalle Ökowegschule',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Kugelbergring 32',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.192598/11.980410',
        amenities: [],
        sort: 0,
      },
      {
        name: 'Sporthalle Albert-Einstein-Schule',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Kirschweg 86',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.200227/11.949445',
        amenities: [],
        sort: 1,
      },
    ],
    trainingGroups: [
      {
        name: 'Kinder & Jugend',
        ageRange: '6 - 17',
        icon: 'youth',
        variant: 'secondary',
        sort: 0,
        sessions: [
          {
            day: 'Dienstag',
            time: '16:30 - 19:00',
            locationName: 'Sporthalle Ökowegschule',
            sort: 0,
          },
          {
            day: 'Donnerstag',
            time: '17:30 - 18:30',
            locationName: 'Sporthalle Albert-Einstein-Schule',
            sort: 1,
          },
        ],
      },
      {
        name: 'Erwachsene',
        ageRange: null,
        icon: 'adults',
        variant: 'primary',
        sort: 1,
        sessions: [
          {
            day: 'Dienstag',
            time: '19:00 - 22:00',
            locationName: 'Sporthalle Ökowegschule',
            sort: 0,
          },
          {
            day: 'Donnerstag',
            time: '18:30 - 22:00',
            locationName: 'Sporthalle Albert-Einstein-Schule',
            sort: 1,
          },
          {
            day: 'Freitag',
            time: '18:00 - 22:00',
            locationName: 'Sporthalle Ökowegschule',
            sort: 2,
          },
        ],
      },
    ],
  },
  {
    name: 'Volleyball',
    slug: 'volleyball',
    shortDescription:
      'Einer für alle, alle für einen! Beim Volleyball stehen Teamgeist und Dynamik im Vordergrund. Pritschen, Baggern und Schmettern – erlebe die Faszination dieses Mannschaftssports.',
    stats: [
      { label: 'Aktive Mitglieder', value: '30', sort: 0 },
      { label: 'Mannschaften', value: '6', sort: 1 },
      { label: 'Volleybälle', value: '35', sort: 2 },
      { label: 'Irgendwas', value: '5', sort: 3 },
    ],
    locations: [
      {
        name: 'Sporthalle Ökowegschule',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Kugelbergring 32',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.192598/11.980410',
        amenities: [],
        sort: 0,
      },
      {
        name: 'Sporthalle Goethegymnasium',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Am Kloster 4',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.199392/11.967936',
        amenities: [],
        sort: 1,
      },
      {
        name: 'Stadthalle',
        badge: 'Haupthalle',
        badgeVariant: 'primary',
        street: 'Beuditzstr. 69',
        city: '06667 Weißenfels',
        mapsUrl: 'https://www.openstreetmap.org/?#map=19/51.201790/11.957084',
        amenities: [],
        sort: 2,
      },
    ],
    trainingGroups: [
      {
        name: 'Erwachsene',
        ageRange: null,
        icon: 'adults',
        variant: 'primary',
        sort: 0,
        sessions: [
          {
            day: 'Montag',
            time: '17:30 - 22:00',
            locationName: 'Sporthalle Ökowegschule',
            sort: 0,
          },
          {
            day: 'Dienstag',
            time: '20:00 - 21:45',
            locationName: 'Sporthalle Goethegymnasium',
            sort: 1,
          },
          {
            day: 'Donnerstag',
            time: '20:00 - 22:00',
            locationName: 'Stadthalle',
            sort: 2,
          },
        ],
      },
    ],
  },
];

const SEED_HISTORY: SeedHistory = {
  heroHeadline: 'DIE CHRONIK',
  heroSubHeadline:
    'Von den ersten Aufschlägen in der Fritz-Juch-Oberschule bis hin zu Erfolgen auf internationaler Bühne – begleiten Sie uns auf einer Zeitreise durch die Geschichte der VSG Kugelberg.',

  foundingHeadline: 'WIE ALLES BEGANN',
  foundingDescription:
    'Zu Beginn der 1980er Jahre entstand in Weißenfels das Wohngebiet „Kugelberg“. Es war eine Zeit des Aufbruchs und der sportlichen Begeisterung. Die Gründungsmitglieder der VSG waren überwiegend dort wohnhaft – so lag es nahe, den Namen des Viertels als Grundlage zur Namensgebung zu wählen.\n\nAls erste Sportstätte wurde die Turnhalle der 1983 eingeweihten Fritz-Juch-Oberschule, die heute als Ökowegschule bekannt ist, vom Verein genutzt. Hier wurden die ersten Weichen für eine Gemeinschaft gestellt, die heute weit über die Grenzen von Weißenfels hinaus bekannt ist.',
  foundingFactCardHeadline: 'DIE ECKDATEN',
  foundingFacts: [
    {
      year: '1985',
      headline: 'VSG „Fortschritt“ Kugelberg',
      description: 'Gründung des Vereins in Weißenfels, Kugelbergring 16.',
    },
    {
      year: '1985',
      headline: 'Friedemann Lange',
      description: 'Erster Vorstandsvorsitzender des Vereins.',
    },
  ],
  foundingMilestonesHeadline: 'MEILENSTEINE & FUSIONEN',
  foundingMilestones: [
    {
      year: '1985',
      headline: 'Gründung der Sektionen',
      description:
        'Start mit Volleyball (Claus Brenner), Pop-Gymnastik (Heike Hofmann) und Tischtennis (Hans-Werner Rust).',
    },
    {
      year: '1990',
      headline: 'Neugründung als VSG Kugelberg e.V.',
      description:
        'Auflösung der alten Struktur am 13.12. and Neugründung unter heutigem Namen am 14.12.1990.',
    },
    {
      year: '1992',
      headline: 'Wachstum durch Anschluss',
      description:
        'Abteilung Tischtennis des 1. SC 1861 Weißenfels schließt sich am 19.06. an.',
    },
    {
      year: '2012',
      headline: 'Badminton-Expansion',
      description:
        'Anschluss der Abt. Badminton von Lok Weißenfels mit 46 neuen Mitgliedern am 01.07.2012.',
    },
  ],

  developmentHeadline: 'ENTWICKLUNG & WACHSTUM',
  developmentDescription:
    'Vom kleinen Kiez-Verein zur festen Größe im Burgenlandkreis. Die Zahlen sprechen für sich.',
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
      headline: '1990 – 2000: Die Anfänge & Erste Jubiläen',
      content: [
        {
          year: '1994:',
          description:
            'Ehrennadel des Landessportbundes in Silber für Jürgen Flister und Walter Reichert.',
        },
        {
          year: '1995:',
          description:
            '10-jähriges Bestehen im Hotel „Schöne Aussicht“ mit 110 Teilnehmern. Erstmalige Ernennung von Ehrenmitgliedern.',
        },
        {
          year: '1990-06:',
          description:
            'Heidi Lange prägt den Verein als Vorstandsvorsitzende over 17 Jahre.',
        },
      ],
    },
    {
      headline: '2001 – 2010: Digitalisierung & Sportbund',
      content: [
        {
          year: '2007:',
          description:
            'Beitritt zum Kreissportbund Burgenlandkreis. Neugestaltung der Homepage und des Vereinslogos.',
        },
        {
          year: '2010:',
          description:
            '25-jähriges Jubiläum im Bootshaus. Teilnahme am Sachsen-Anhalt Tag in Weißenfels.',
        },
      ],
    },
    {
      headline: '2011 – 2019: Auszeichnungen & Erfolge',
      content: [
        {
          year: '2013-15:',
          description:
            'Mehrfache Homepage-Relaunches. Rosa Beck und Hans-Werner Rust erhalten LSB-Ehrennadel in Silber.',
        },
        {
          year: '2017:',
          description:
            'Heidrun Hauser wird Sportlerin des Jahres im Burgenlandkreis (12.115 Stimmen).',
        },
        {
          year: '2019:',
          description:
            'Tischtennis-Herrenmannschaft belegt 3. Platz bei der Sportlerwahl – vor dem MBC!',
        },
      ],
    },
    {
      headline: '2020 – 2022: Pandemie & Neuanfang',
      content: [
        {
          year: '2020:',
          description:
            'Corona-Pandemie: Erste Schließung am 13.03.2020. Wiedereröffnung im Juni/Juli unter strengen Auflagen.',
        },
        {
          year: '2022:',
          description:
            'Rückkehr in die Albert-Einstein-Halle nach zweijähriger Sanierung am 01.02.2022.',
        },
      ],
    },
  ],

  festivalsHeadline: 'GEMEINSAM AKTIV',
  festivalsDescription:
    'Sport ist nur die halbe Miete. Bei uns wird Gemeinschaft großgeschrieben – ob auf dem Rad, dem Schiff oder der Rodelbahn.',
  festivalsItems: [
    {
      headline: 'ALLWETTERRODELBAHN',
      text: 'Ein Dauerbrenner für Jung und Alt. Bis zu 53 Teilnehmer (2020) jagen jährlich durch die Kurven und messen sich beim Minigolf.',
    },
    {
      headline: 'RADTOUREN',
      text: 'Ob zum Halleschen Anger oder Richtung Uichteritz – unsere Radtouren stärken den Zusammenhalt auch abseits der Sporthallen.',
    },
    {
      headline: 'KULTUR & AUSFLÜGE',
      text: 'Traumschiff-Fahrten, Besuche des Gosecker Schlosses oder Bowlingabende sorgen für Abwechslung und gute Laune im Vereinskalender.',
    },
  ],

  achievementsHeadline: 'HALL OF FAME',
  achievementsItems: [
    {
      year: '2013',
      category: 'badminton',
      headline: 'Deutsche Meisterschaften Berlin',
      description: 'Heidrun Hauser belegt im Einzel und Doppel den 3. Platz.',
    },
    {
      year: '2014',
      category: 'badminton',
      headline: 'Norddeutsche Meisterschaften',
      description:
        'Helmut Wiegand wird 1. im Doppel. Heidrun Hauser wird Deutsche Vizemeisterin im Doppel.',
    },
    {
      year: '2013',
      category: 'table-tennis',
      headline: 'Landespokalsieg Klasse B',
      description:
        'Andreas & Matthias Fekl sowie Marco Merten gewinnen den Landespokal in Riestedt.',
    },
    {
      year: '2015',
      category: 'table-tennis',
      headline: 'Landespokalsieg Klasse A',
      description:
        'Erster Sieg in der Königsklasse durch Andreas & Johannes Fekl sowie André Kreisel.',
    },
    {
      year: '2018',
      category: 'table-tennis',
      headline: 'Aufstieg Verbandsliga',
      description:
        'Erstmaliger Aufstieg der 1. Herrenmannschaft in die höchste Spielklasse des Landes.',
    },
    {
      year: '2012',
      category: 'volleyball',
      headline: 'Landesmeister Ü53',
      description:
        'Lars Hoffmann und Jörg Schmeißer gewinnen den Titel in Halle-Neustadt.',
    },
    {
      year: '2018',
      category: 'volleyball',
      headline: 'Nordostdeutscher Meister',
      description:
        'Titelgewinn für Hoffmann/Schmeißer in der Altersklasse Ü59.',
    },
  ],

  ctaHeadline: 'Werde Teil unserer Geschichte',
  ctaDescription:
    'Schließe dich unserer Gemeinschaft an und schreibe das nächste Kapitel mit uns.',
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..', '..', '..');

const getCsvFilePath = (fileName: string): string => path.join(projectRoot, 'data', fileName);

const ensureCsvHeaders = (headers: string[]): string[] => {
  const missingHeaders = CONTACT_PERSON_HEADERS.filter((header) => !headers.includes(header));

  if (missingHeaders.length > 0) {
    throw new Error(`Missing required CSV headers: ${missingHeaders.join(', ')}`);
  }

  return headers;
};

const normalizeCsvValue = (value: string | undefined): string => (value ?? '').trim();

const parseContactPersonsCsv = async (filePath: string): Promise<ContactPersonSeedRow[]> => new Promise((resolve, reject) => {
  const rows: ContactPersonSeedRow[] = [];
  let rowNumber = 0;

  fs.createReadStream(filePath)
    .pipe(parse({
      headers: (headers) => ensureCsvHeaders(headers.map((header) => header.trim())),
      ignoreEmpty: true,
      trim: true,
    }))
    .on('error', (error) => reject(error))
    .on('data', (row: ContactPersonCsvRow) => {
      rowNumber += 1;
      const firstName = normalizeCsvValue(row.firstName);
      const lastName = normalizeCsvValue(row.lastName);
      const type = normalizeCsvValue(row.type);
      const emailValue = normalizeCsvValue(row.email);
      const addressValue = normalizeCsvValue(row.address);
      const phone = normalizeCsvValue(row.phone);

      rows.push({
        firstName,
        lastName,
        type,
        email: emailValue || `missing-${rowNumber}@${PLACEHOLDER_EMAIL_DOMAIN}`,
        address: addressValue.length > 0 ? addressValue : null,
        phone,
        rowNumber,
      });
    })
    .on('end', () => resolve(rows));
});

const validateContactPersonRows = (rows: ContactPersonSeedRow[]): void => {
  const errors: string[] = [];

  rows.forEach((row) => {
    const rowErrors: string[] = [];

    if (!row.firstName) {
      rowErrors.push('firstName is required');
    }
    if (!row.lastName) {
      rowErrors.push('lastName is required');
    }
    if (!row.type) {
      rowErrors.push('type is required');
    }
    if (!row.phone) {
      rowErrors.push('phone is required');
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${row.rowNumber}: ${rowErrors.join(', ')}`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Contact person CSV validation failed:\n${errors.join('\n')}`);
  }
};

const seedContactPersons = async (pgClient: pg.Client): Promise<number> => {
  console.log('\n--- Seeding Contact Persons ---');

  const filePath = getCsvFilePath(CSV_FILE_NAME);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required CSV file: ${filePath}`);
  }

  const rows = await parseContactPersonsCsv(filePath);

  if (rows.length === 0) {
    console.log('  No contact persons found in CSV file.');
    return 0;
  }

  validateContactPersonRows(rows);

  let seededCount = 0;

  for (const row of rows) {
    const result = await pgClient.query(
      `INSERT INTO "ContactPerson" ("firstName", "lastName", "type", "email", "address", "phone", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [row.firstName, row.lastName, row.type, row.email, row.address, row.phone],
    );

    if (result.rows.length > 0) {
      seededCount++;
    }
  }

  console.log(`Seeded ${seededCount} contact persons`);
  return seededCount;
};

// Seeding functions
const seedUsers = async (pgClient: pg.Client): Promise<number> => {
  console.log('\n--- Seeding Users ---');

  let seededCount = 0;

  for (const user of SEED_USERS) {
    const result = await pgClient.query(
      `INSERT INTO "User" ("username", "email", "password", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT ("email") DO NOTHING
       RETURNING id`,
      [user.username, user.email, user.password],
    );

    if (result.rows.length > 0) {
      console.log(`  Created user: ${user.username} (id: ${result.rows[0].id})`);
      seededCount++;
    } else {
      console.log(`  Skipped existing user: ${user.username}`);
    }
  }

  console.log(`Seeded ${seededCount} users`);
  return seededCount;
};

const seedDepartments = async (pgClient: pg.Client): Promise<DepartmentMap> => {
  console.log('\n--- Seeding Departments ---');

  const departmentMap: DepartmentMap = new Map();
  let seededCount = 0;

  for (const dept of SEED_DEPARTMENT_DATA) {
    const result = await pgClient.query(
      `INSERT INTO "Department" ("name", "slug", "shortDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT ("slug") DO UPDATE SET
         "name" = EXCLUDED."name",
         "shortDescription" = EXCLUDED."shortDescription",
         "updatedAt" = NOW()
       RETURNING id`,
      [dept.name, dept.slug, dept.shortDescription],
    );

    const departmentId = result.rows[0].id;
    departmentMap.set(dept.slug, departmentId);

    if (result.rowCount && result.rowCount > 0) {
      console.log(`  Created/Updated department: ${dept.name} (id: ${departmentId})`);
      seededCount++;
    }
  }

  console.log(`Seeded ${seededCount} departments`);
  return departmentMap;
};

const seedDepartmentStats = async (
  pgClient: pg.Client,
  departmentMap: DepartmentMap,
): Promise<number> => {
  console.log('\n--- Seeding Department Stats ---');

  let seededCount = 0;

  for (const dept of SEED_DEPARTMENT_DATA) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      console.warn(`  Warning: Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing stats for this department to ensure idempotency
    await pgClient.query(`DELETE FROM "DepartmentStat" WHERE "departmentId" = $1`, [
      departmentId,
    ]);

    for (const stat of dept.stats) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentStat" ("departmentId", "label", "value", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, NOW(), NOW())
         RETURNING id`,
        [departmentId, stat.label, stat.value, stat.sort],
      );

      if (result.rows.length > 0) {
        seededCount++;
      }
    }
    console.log(`  Seeded ${dept.stats.length} stats for ${dept.name}`);
  }

  console.log(`Seeded ${seededCount} department stats total`);
  return seededCount;
};

const seedDepartmentLocations = async (
  pgClient: pg.Client,
  departmentMap: DepartmentMap,
): Promise<LocationMap> => {
  console.log('\n--- Seeding Department Locations ---');

  const locationMap: LocationMap = new Map();
  let seededCount = 0;

  for (const dept of SEED_DEPARTMENT_DATA) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      console.warn(`  Warning: Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing locations for this department to ensure idempotency
    await pgClient.query(`DELETE FROM "DepartmentLocation" WHERE "departmentId" = $1`, [
      departmentId,
    ]);

    const deptLocationMap = new Map<string, number>();
    locationMap.set(dept.slug, deptLocationMap);

    for (const location of dept.locations) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentLocation" ("departmentId", "name", "badge", "badgeVariant", "street", "city", "mapsUrl", "amenities", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
         RETURNING id`,
        [
          departmentId,
          location.name,
          location.badge,
          location.badgeVariant,
          location.street,
          location.city,
          location.mapsUrl,
          JSON.stringify(location.amenities),
          location.sort,
        ],
      );

      if (result.rows.length > 0) {
        const locationId = result.rows[0].id;
        deptLocationMap.set(location.name, locationId);
        seededCount++;
      }
    }
    console.log(`  Seeded ${dept.locations.length} locations for ${dept.name}`);
  }

  console.log(`Seeded ${seededCount} department locations total`);
  return locationMap;
};

const seedDepartmentTrainingGroups = async (
  pgClient: pg.Client,
  departmentMap: DepartmentMap,
): Promise<TrainingGroupMap> => {
  console.log('\n--- Seeding Training Groups ---');

  const trainingGroupMap: TrainingGroupMap = new Map();
  let seededCount = 0;

  for (const dept of SEED_DEPARTMENT_DATA) {
    const departmentId = departmentMap.get(dept.slug);
    if (!departmentId) {
      console.warn(`  Warning: Department not found for slug: ${dept.slug}`);
      continue;
    }

    // Delete existing training groups (and their sessions via cascade) for this department
    await pgClient.query(`DELETE FROM "DepartmentTrainingGroup" WHERE "departmentId" = $1`, [
      departmentId,
    ]);

    const deptGroupMap = new Map<string, number>();
    trainingGroupMap.set(dept.slug, deptGroupMap);

    for (const group of dept.trainingGroups) {
      const result = await pgClient.query(
        `INSERT INTO "DepartmentTrainingGroup" ("departmentId", "name", "ageRange", "icon", "variant", "sort", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING id`,
        [departmentId, group.name, group.ageRange, group.icon, group.variant, group.sort],
      );

      if (result.rows.length > 0) {
        const groupId = result.rows[0].id;
        deptGroupMap.set(group.name, groupId);
        seededCount++;
      }
    }
    console.log(`  Seeded ${dept.trainingGroups.length} training groups for ${dept.name}`);
  }

  console.log(`Seeded ${seededCount} training groups total`);
  return trainingGroupMap;
};

const seedDepartmentTrainingSessions = async (
  pgClient: pg.Client,
  locationMap: LocationMap,
  trainingGroupMap: TrainingGroupMap,
): Promise<number> => {
  console.log('\n--- Seeding Training Sessions ---');

  let seededCount = 0;

  for (const dept of SEED_DEPARTMENT_DATA) {
    const deptLocationMap = locationMap.get(dept.slug);
    const deptGroupMap = trainingGroupMap.get(dept.slug);

    if (!deptLocationMap || !deptGroupMap) {
      console.warn(`  Warning: Maps not found for department: ${dept.slug}`);
      continue;
    }

    let deptSessionCount = 0;

    for (const group of dept.trainingGroups) {
      const groupId = deptGroupMap.get(group.name);
      if (!groupId) {
        console.warn(`  Warning: Group not found: ${group.name} in ${dept.slug}`);
        continue;
      }

      for (const session of group.sessions) {
        const locationId = deptLocationMap.get(session.locationName);
        if (!locationId) {
          console.warn(
            `  Warning: Location not found: ${session.locationName} in ${dept.slug}`,
          );
          continue;
        }

          const result = await pgClient.query(
          `INSERT INTO "DepartmentTrainingSession" ("trainingGroupId", "locationId", "day", "time", "sort", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
           RETURNING id`,
          [groupId, locationId, session.day, session.time, session.sort],
        );

        if (result.rows.length > 0) {
          seededCount++;
          deptSessionCount++;
        }
      }
    }
    console.log(`  Seeded ${deptSessionCount} training sessions for ${dept.name}`);
  }

  console.log(`Seeded ${seededCount} training sessions total`);
  return seededCount;
};

const seedHistory = async (pgClient: pg.Client): Promise<void> => {
  console.log('\n--- Seeding History ---');

  // Check if history already exists
  const checkResult = await pgClient.query('SELECT id FROM "HistoryContent" WHERE id = 1');
  if (checkResult.rows.length > 0) {
    console.log('  History content already exists, skipping.');
    return;
  }

  // 1. Create HistoryContent
  await pgClient.query(
    `INSERT INTO "HistoryContent" (
      "id", "heroHeadline", "heroSubHeadline", "foundingHeadline", "foundingDescription",
      "foundingFactCardHeadline", "foundingMilestonesHeadline", "developmentHeadline",
      "developmentDescription", "festivalsHeadline", "festivalsDescription",
      "achievementsHeadline", "ctaHeadline", "ctaDescription", "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW()
    )`,
    [
      1,
      SEED_HISTORY.heroHeadline,
      SEED_HISTORY.heroSubHeadline,
      SEED_HISTORY.foundingHeadline,
      SEED_HISTORY.foundingDescription,
      SEED_HISTORY.foundingFactCardHeadline,
      SEED_HISTORY.foundingMilestonesHeadline,
      SEED_HISTORY.developmentHeadline,
      SEED_HISTORY.developmentDescription,
      SEED_HISTORY.festivalsHeadline,
      SEED_HISTORY.festivalsDescription,
      SEED_HISTORY.achievementsHeadline,
      SEED_HISTORY.ctaHeadline,
      SEED_HISTORY.ctaDescription,
    ],
  );

  // 2. Seed Relations
  for (let i = 0; i < SEED_HISTORY.foundingFacts.length; i++) {
    const f = SEED_HISTORY.foundingFacts[i];
    await pgClient.query(
      `INSERT INTO "HistoryFact" ("historyContentId", "year", "headline", "description", "sort")
       VALUES ($1, $2, $3, $4, $5)`,
      [1, f.year, f.headline, f.description, i],
    );
  }

  for (let i = 0; i < SEED_HISTORY.foundingMilestones.length; i++) {
    const m = SEED_HISTORY.foundingMilestones[i];
    await pgClient.query(
      `INSERT INTO "HistoryMilestone" ("historyContentId", "year", "headline", "description", "sort")
       VALUES ($1, $2, $3, $4, $5)`,
      [1, m.year, m.headline, m.description, i],
    );
  }

  // Chart Labels
  for (let i = 0; i < SEED_HISTORY.developmentChartData.labels.length; i++) {
    await pgClient.query(
      `INSERT INTO "HistoryChartLabel" ("historyContentId", "label", "sort")
       VALUES ($1, $2, $3)`,
      [1, SEED_HISTORY.developmentChartData.labels[i], i],
    );
  }

  // Datasets and Values
  for (let i = 0; i < SEED_HISTORY.developmentChartData.datasets.length; i++) {
    const ds = SEED_HISTORY.developmentChartData.datasets[i];
    const dsResult = await pgClient.query(
      `INSERT INTO "HistoryChartDataset" ("historyContentId", "label", "sort")
       VALUES ($1, $2, $3) RETURNING id`,
      [1, ds.label, i],
    );
    const dsId = dsResult.rows[0].id;

    for (let j = 0; j < ds.data.length; j++) {
      await pgClient.query(
        `INSERT INTO "HistoryChartValue" ("datasetId", "value", "sort")
         VALUES ($1, $2, $3)`,
        [dsId, ds.data[j], j],
      );
    }
  }

  // Chronicle Groups
  for (let i = 0; i < SEED_HISTORY.developmentChronicleGroups.length; i++) {
    const g = SEED_HISTORY.developmentChronicleGroups[i];
    const gResult = await pgClient.query(
      `INSERT INTO "HistoryChronicleGroup" ("historyContentId", "headline", "sort")
       VALUES ($1, $2, $3) RETURNING id`,
      [1, g.headline, i],
    );
    const gId = gResult.rows[0].id;

    for (let j = 0; j < g.content.length; j++) {
      const e = g.content[j];
      await pgClient.query(
        `INSERT INTO "HistoryChronicleEntry" ("groupId", "year", "description", "sort")
         VALUES ($1, $2, $3, $4)`,
        [gId, e.year, e.description, j],
      );
    }
  }

  for (let i = 0; i < SEED_HISTORY.festivalsItems.length; i++) {
    const f = SEED_HISTORY.festivalsItems[i];
    await pgClient.query(
      `INSERT INTO "HistoryFestivalItem" ("historyContentId", "headline", "text", "sort")
       VALUES ($1, $2, $3, $4)`,
      [1, f.headline, f.text, i],
    );
  }

  for (let i = 0; i < SEED_HISTORY.achievementsItems.length; i++) {
    const a = SEED_HISTORY.achievementsItems[i];
    await pgClient.query(
      `INSERT INTO "HistoryAchievement" ("historyContentId", "year", "headline", "description", "category", "sort")
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [1, a.year, a.headline, a.description, a.category, i],
    );
  }

  console.log('  History content seeded successfully.');
};

// Migration functions
const migrateCategories = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
): Promise<CategoryMap> => {
  console.log('\n--- Migrating Categories ---');

  const [rows] = await mysqlConn.query(CATEGORY_QUERY);
  const categories = rows as JoomlaCategory[];
  console.log(`Found ${categories.length} categories`);

  const categoryMap: CategoryMap = new Map();

  for (const category of categories) {
    const parentId = category.parentId === 1
      ? null
      : category.parentId !== null
        ? categoryMap.get(category.parentId) ?? null
        : null;

    if (category.parentId !== null && category.parentId !== 1 && parentId === null) {
      console.warn(`  Warning: Parent not found for "${category.name}" (parent_id=${category.parentId})`);
    }

    const result = await pgClient.query(
      `INSERT INTO "Category" ("name", "slug", "description", "parentId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id`,
      [category.name, category.slug, category.description, parentId, new Date(), new Date()],
    );

    const newId = result.rows[0].id;
    categoryMap.set(category.id, newId);
    console.log(`  ${category.name}: MySQL ${category.id} → Postgres ${newId}`);
  }

  console.log(`Migrated ${categoryMap.size} categories`);
  return categoryMap;
};

const migratePostsForCategory = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
  category: JoomlaCategory,
): Promise<number> => {
  const [rows] = await mysqlConn.query(POST_QUERY, [category.id]);
  const posts = rows as JoomlaPost[];

  if (posts.length === 0) {
    return 0;
  }

  let migratedCount = 0;

  for (const post of posts) {
    const slug = slugify(post.title, { lower: true, strict: true });

    const result = await pgClient.query(
      `INSERT INTO "Post" ("title", "slug", "content", "published", "hits", "oldPost", "authorId", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT ("slug") DO NOTHING
       RETURNING id`,
      [
        post.title,
        slug,
        post.content,
        post.published === 1,
        post.hits,
        post.oldPost === 1,
        post.authorId,
        new Date(post.created),
        new Date(post.modified),
      ],
    );

    if (result.rows.length > 0) {
      migratedCount++;
    } else {
      console.log(`    Skipped duplicate: ${post.id} ${post.title}`);
    }
  }

  return migratedCount;
};

const migratePosts = async (
  mysqlConn: mysql.Connection,
  pgClient: pg.Client,
  categories: JoomlaCategory[],
  categoryMap: CategoryMap,
): Promise<number> => {
  console.log('\n--- Migrating Posts ---');

  let totalPosts = 0;

  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    const pgCategoryId = categoryMap.get(category.id);

    if (!pgCategoryId) {
      console.warn(`  Skipping "${category.name}" - no Postgres ID found`);
      continue;
    }

    const count = await migratePostsForCategory(mysqlConn, pgClient, category);
    totalPosts += count;

    if (count > 0) {
      console.log(`  [${i + 1}/${categories.length}] ${category.name}: ${count} posts`);
    }
  }

  console.log(`Migrated ${totalPosts} posts total`);
  return totalPosts;
};

// Main
const main = async (): Promise<void> => {
  let mysqlConn: mysql.Connection | null = null;
  let pgClient: pg.Client | null = null;

  try {
    console.log('=== MySQL to PostgreSQL Migration ===\n');

    // Connect to databases (single connections, not pools)
    mysqlConn = await createMySqlConnection(getDbConfig('MYSQL'));
    pgClient = await createPostgresClient(getDbConfig('POSTGRES'));

    // Seed users and departments first
    const usersSeeded = await seedUsers(pgClient);
    const contactPersonsSeeded = await seedContactPersons(pgClient);
    const departmentMap = await seedDepartments(pgClient);
    const statsSeeded = await seedDepartmentStats(pgClient, departmentMap);
    const locationMap = await seedDepartmentLocations(pgClient, departmentMap);
    const trainingGroupMap = await seedDepartmentTrainingGroups(pgClient, departmentMap);
    const sessionsSeeded = await seedDepartmentTrainingSessions(
      pgClient,
      locationMap,
      trainingGroupMap,
    );
    await seedHistory(pgClient);

    // Fetch categories from MySQL
    const [categoryRows] = await mysqlConn.query(CATEGORY_QUERY);
    const categories = categoryRows as JoomlaCategory[];

    // Migrate
    const categoryMap = await migrateCategories(mysqlConn, pgClient);
    const totalPosts = await migratePosts(mysqlConn, pgClient, categories, categoryMap);

    // Summary
    console.log('\n=== Migration Complete ===');
    console.log(`Users seeded: ${usersSeeded}`);
    console.log(`Contact persons seeded: ${contactPersonsSeeded}`);
    console.log(`Departments seeded: ${departmentMap.size}`);
    console.log(`Department stats seeded: ${statsSeeded}`);
    console.log(`Department locations seeded: ${locationMap.size === 0 ? 0 : Array.from(locationMap.values()).reduce((sum, map) => sum + map.size, 0)}`);
    console.log(`Training groups seeded: ${trainingGroupMap.size === 0 ? 0 : Array.from(trainingGroupMap.values()).reduce((sum, map) => sum + map.size, 0)}`);
    console.log(`Training sessions seeded: ${sessionsSeeded}`);
    console.log(`Categories: ${categoryMap.size}`);
    console.log(`Posts: ${totalPosts}`);
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    if (pgClient) {
      await pgClient.end();
      console.log('\nPostgreSQL connection closed');
    }
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('MySQL connection closed');
    }
  }
};

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
