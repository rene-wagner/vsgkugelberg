// MySQL to PostgreSQL Migration Tool
// This tool migrates data from a MySQL database to a PostgreSQL database
// Run with: pnpm --filter migrate-mysql-to-postgres migrate

import 'dotenv/config';
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

const SEED_DEPARTMENTS: SeedDepartment[] = [
  {
    name: 'Badminton',
    slug: 'badminton',
    shortDescription:
      'Dynamic badminton club offering training and competitions for all skill levels.',
  },
  {
    name: 'Gymnastics',
    slug: 'gymnastics',
    shortDescription:
      'Comprehensive gymnastics program for children and adults focusing on flexibility and strength.',
  },
  {
    name: 'Table Tennis',
    slug: 'table-tennis',
    shortDescription:
      'Fast-paced table tennis club with regular training sessions and league competitions.',
  },
  {
    name: 'Volleyball',
    slug: 'volleyball',
    shortDescription:
      'Team-oriented volleyball department offering indoor and beach volleyball programs.',
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

const seedDepartments = async (pgClient: pg.Client): Promise<number> => {
  console.log('\n--- Seeding Departments ---');

  let seededCount = 0;

  for (const dept of SEED_DEPARTMENTS) {
    const result = await pgClient.query(
      `INSERT INTO "Department" ("name", "slug", "shortDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       ON CONFLICT ("slug") DO NOTHING
       RETURNING id`,
      [dept.name, dept.slug, dept.shortDescription],
    );

    if (result.rows.length > 0) {
      console.log(`  Created department: ${dept.name} (id: ${result.rows[0].id})`);
      seededCount++;
    } else {
      console.log(`  Skipped existing department: ${dept.name}`);
    }
  }

  console.log(`Seeded ${seededCount} departments`);
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
    const departmentsSeeded = await seedDepartments(pgClient);
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
    console.log(`Departments seeded: ${departmentsSeeded}`);
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
