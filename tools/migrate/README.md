# Migration Tool

A one-time migration tool for transferring data from the legacy MySQL (Joomla) database to the new PostgreSQL database used by the VSG Kugelberg application.

## Overview

This tool performs two main operations:

1. **Seeding**: Populates PostgreSQL with initial data from JSON files
   - Users (2 seed users)
   - Contact persons (10 contact persons)
   - Departments with stats, locations, training groups, and sessions
   - Club history content

2. **Migration**: Migrates legacy content from MySQL to PostgreSQL
   - Categories (hierarchical structure)
   - Blog posts (with automatic slug generation)

## Project Structure

```
tools/migrate/
├── src/
│   ├── index.ts                      # Main entry point with CLI
│   ├── config/
│   │   ├── database.ts               # Database connection configuration
│   │   └── constants.ts              # SQL queries and constants
│   ├── types/
│   │   ├── database.ts               # Database connection types
│   │   ├── joomla.ts                 # MySQL/Joomla data types
│   │   ├── seed-data.ts              # Seed data interfaces
│   │   └── index.ts                  # Barrel export
│   ├── utils/
│   │   ├── logger.ts                 # Colored console logging
│   │   ├── timer.ts                  # Time tracking utility
│   │   ├── data-loader.ts            # JSON file loading functions
│   │   └── index.ts                  # Barrel export
│   ├── database/
│   │   ├── mysql.ts                  # MySQL connection with spinner
│   │   ├── postgres.ts               # PostgreSQL connection with spinner
│   │   └── index.ts                  # Barrel export
│   ├── seeders/
│   │   ├── user-seeder.ts            # Seeds users
│   │   ├── contact-person-seeder.ts  # Seeds contact persons from JSON
│   │   ├── department-seeder.ts      # Seeds departments and related data
│   │   ├── history-seeder.ts         # Seeds club history
│   │   └── index.ts                  # Barrel export
│   └── migrators/
│       ├── category-migrator.ts      # Migrates categories from MySQL
│       ├── post-migrator.ts          # Migrates posts from MySQL
│       └── index.ts                  # Barrel export
├── data/
│   ├── users.json                    # Seed user data
│   ├── departments.json              # Department data with related entities
│   ├── history.json                  # Club history content
│   └── contact-persons.json          # Contact persons data
├── package.json
├── tsconfig.json
└── README.md                         # This file
```

## Prerequisites

### Environment Variables

Create a `.env` file in the project root with the following variables:

#### MySQL (Source Database)
```bash
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=your_mysql_user
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=your_joomla_database
```

#### PostgreSQL (Target Database)
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

### Database Requirements

- **MySQL**: Legacy Joomla 3.x database with `j3x_categories` and `j3x_content` tables
- **PostgreSQL**: VSG Kugelberg database with Prisma schema applied (run migrations first)

## Usage

### Running the Migration

From the project root:

```bash
pnpm --filter migrate migrate
```

Or from the `tools/migrate` directory:

```bash
pnpm migrate
```

### Expected Output

```
═══════════════════════════════════════════
  MySQL → PostgreSQL Migration Tool
═══════════════════════════════════════════

✔ Connected to MySQL at localhost:3306
✔ Connected to PostgreSQL at localhost:5432

✔ Seeded 2 users
✔ Seeded 15 contact persons
✔ Seeded departments: 4 departments, 16 stats, 8 locations, 6 groups, 13 sessions
✔ Seeded history content
✔ Migrated 156 categories
✔ Migrated 234 posts

═══════════════════════════════════════════
  Migration Summary
═══════════════════════════════════════════

┌─────────────────────────┬────────────┬───────────────┐
│ Operation               │ Count      │ Status        │
├─────────────────────────┼────────────┼───────────────┤
│ Users                   │ 2          │ ✓ Complete    │
├─────────────────────────┼────────────┼───────────────┤
│ Contact Persons         │ 15         │ ✓ Complete    │
├─────────────────────────┼────────────┼───────────────┤
│ Departments             │ 4          │ ✓ Complete    │
├─────────────────────────┼────────────┼───────────────┤
│ Categories              │ 156        │ ✓ Complete    │
├─────────────────────────┼────────────┼───────────────┤
│ Posts                   │ 234        │ ✓ Complete    │
└─────────────────────────┴────────────┴───────────────┘

Total time: 8.45s

✔ Closed PostgreSQL connection
✔ Closed MySQL connection
```

## Architecture

### Seeders

Seeders populate PostgreSQL with initial data from JSON files and CSV.

#### User Seeder (`user-seeder.ts`)
- **Source**: `data/users.json`
- **Target**: `User` table
- **Behavior**: Skips existing users (by email)
- **Purpose**: Creates initial admin/test users

#### Contact Person Seeder (`contact-person-seeder.ts`)
- **Source**: `data/contact-persons.json`
- **Target**: `ContactPerson` table
- **Behavior**: Generates placeholder emails for missing email addresses
- **Purpose**: Populates club contact directory

#### Department Seeder (`department-seeder.ts`)
- **Source**: `data/departments.json`
- **Target**: Multiple tables (Department, DepartmentStat, DepartmentLocation, DepartmentTrainingGroup, DepartmentTrainingSession)
- **Behavior**: Complex seeder that handles entire department hierarchy
- **Idempotency**: Deletes and recreates stats, locations, groups, and sessions on each run
- **Purpose**: Sets up sports department structure

#### History Seeder (`history-seeder.ts`)
- **Source**: `data/history.json`
- **Target**: Multiple tables (HistoryContent, HistoryFact, HistoryMilestone, HistoryChartLabel, HistoryChartDataset, HistoryChartValue, HistoryChronicleGroup, HistoryChronicleEntry, HistoryFestivalItem, HistoryAchievement)
- **Behavior**: Skips if history content already exists (id=1)
- **Purpose**: Populates club history page content

### Migrators

Migrators transfer data from MySQL (Joomla) to PostgreSQL.

#### Category Migrator (`category-migrator.ts`)
- **Source**: MySQL `j3x_categories` table
- **Target**: PostgreSQL `Category` table
- **Features**:
  - Preserves hierarchical parent-child relationships
  - Maps old MySQL IDs to new PostgreSQL IDs
  - Warns about missing parent categories (continues execution)
- **Query**: Fetches published content categories ordered by left-right tree position

#### Post Migrator (`post-migrator.ts`)
- **Source**: MySQL `j3x_content` table
- **Target**: PostgreSQL `Post` table
- **Features**:
  - Generates URL-friendly slugs from titles using `slugify`
  - Skips duplicate slugs (ON CONFLICT DO NOTHING)
  - Excludes specific post IDs (blacklist in query)
  - Associates posts with migrated categories
- **Behavior**: Iterates through all categories and migrates posts for each

## Seed Data Files

### Editing Users (`data/users.json`)

JSON array of user objects:

```json
[
  {
    "username": "john.doe",
    "email": "john.doe@example.com",
    "password": "$2b$10$..." // bcrypt hash
  }
]
```

**Notes**:
- Passwords are bcrypt hashes (use `bcrypt.hash()` to generate)
- Email must be unique

### Editing Departments (`data/departments.json`)

JSON array of complete department data:

```json
[
  {
    "name": "Badminton",
    "slug": "badminton",
    "shortDescription": "...",
    "stats": [
      { "label": "Aktive Mitglieder", "value": "30", "sort": 0 }
    ],
    "locations": [
      {
        "name": "Sporthalle",
        "badge": "Haupthalle",
        "badgeVariant": "primary",
        "street": "Zeitzer Str. 23b",
        "city": "06667 Weißenfels",
        "mapsUrl": "https://...",
        "amenities": [],
        "sort": 0
      }
    ],
    "trainingGroups": [
      {
        "name": "Kinder & Jugend",
        "ageRange": "6 - 17",
        "icon": "youth",
        "variant": "secondary",
        "sort": 0,
        "sessions": [
          {
            "day": "Freitag",
            "time": "17:00 - 19:00",
            "locationName": "Sporthalle", // Must match location name
            "sort": 0
          }
        ]
      }
    ]
  }
]
```

**Important**:
- `slug` must be unique
- `sessions[].locationName` must match a `locations[].name` in the same department
- `icon` must be "youth" or "adults"
- `variant` and `badgeVariant` must be "primary" or "secondary"

### Editing History (`data/history.json`)

JSON object with club history content:

```json
{
  "heroHeadline": "DIE CHRONIK",
  "heroSubHeadline": "...",
  "foundingHeadline": "WIE ALLES BEGANN",
  "foundingDescription": "...",
  "foundingFacts": [
    { "year": "1985", "headline": "...", "description": "..." }
  ],
  "developmentChartData": {
    "labels": ["2000", "2005"],
    "datasets": [
      { "label": "Mitglieder", "data": [111, 96] }
    ]
  },
  // ... more sections
}
```

**Notes**:
- `developmentChartData` is used for Chart.js rendering
- Arrays maintain order via index (no explicit sort field)

### Editing Contact Persons (`data/contact-persons.json`)

JSON array of contact person objects:

```json
[
  {
    "firstName": "John",
    "lastName": "Doe",
    "type": "Vorstand",
    "email": "john@example.com",
    "address": "Main St 1, 06667 Weißenfels",
    "phone": "+49 123 456789"
  },
  {
    "firstName": "Jane",
    "lastName": "Smith",
    "type": "Abteilung",
    "email": "",
    "address": null,
    "phone": "+49 987 654321"
  }
]
```

**Required Fields**:
- `firstName`
- `lastName`
- `type`
- `phone`

**Optional Fields**:
- `email` (empty string generates placeholder: `missing-{index}@vsg-kugelberg.de`)
- `address` (nullable)

## Error Handling

### Warnings vs Errors

**Warnings** (logged but execution continues):
- Parent category not found during migration
- Department/location/group not found in mapping
- Duplicate post slugs (skipped)

**Errors** (halt execution):
- Missing environment variables
- Database connection failures
- Missing required JSON file
- SQL constraint violations

### Common Issues

#### Missing Environment Variables
```
Error: Missing required environment variables: MYSQL_HOST, MYSQL_PASSWORD
```
**Solution**: Ensure all required env vars are set in `.env`

#### Connection Refused
```
Failed to connect to MySQL
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Verify MySQL is running and credentials are correct

## Extending the Tool

### Adding a New Seeder

1. Create new file in `src/seeders/new-seeder.ts`:

```typescript
import ora from 'ora';
import type { Client } from 'pg';

export async function seedNewData(pgClient: Client): Promise<number> {
  const spinner = ora('Seeding new data...').start();
  
  try {
    // Your seeding logic here
    const count = 0; // Count seeded records
    
    spinner.succeed(`Seeded ${count} records`);
    return count;
  } catch (error) {
    spinner.fail('Failed to seed new data');
    throw error;
  }
}
```

2. Export from `src/seeders/index.ts`:

```typescript
export * from './new-seeder';
```

3. Call in `src/index.ts`:

```typescript
const newDataCount = await seedNewData(pgClient);
```

### Adding a New Migrator

1. Create new file in `src/migrators/new-migrator.ts`:

```typescript
import ora from 'ora';
import type { Connection } from 'mysql2/promise';
import type { Client } from 'pg';

export async function migrateNewData(
  mysqlConn: Connection,
  pgClient: Client
): Promise<number> {
  const spinner = ora('Migrating new data...').start();
  
  try {
    // Your migration logic here
    const count = 0; // Count migrated records
    
    spinner.succeed(`Migrated ${count} records`);
    return count;
  } catch (error) {
    spinner.fail('Failed to migrate new data');
    throw error;
  }
}
```

2. Export and call similarly to seeders

### Adding New Seed Data Files

1. Create JSON file in `data/new-data.json`

2. Add type definition in `src/types/seed-data.ts`:

```typescript
export interface NewSeedData {
  // Your fields here
}
```

3. Add loader function in `src/utils/data-loader.ts`:

```typescript
export async function loadNewSeedData(): Promise<NewSeedData[]> {
  const data = await fs.readFile(path.join(DATA_DIR, 'new-data.json'), 'utf-8');
  return JSON.parse(data);
}
```

## Troubleshooting

### Migration Runs Multiple Times

The migration is designed to be **idempotent** where possible:
- Users: Skips existing (by email)
- Departments: Updates existing (by slug)
- Department relations: Deletes and recreates
- History: Skips if exists (id=1)
- Categories: No conflict handling (will error on duplicate)
- Posts: Skips duplicate slugs

**Recommendation**: Drop and recreate the PostgreSQL database if you need a clean slate.

### Slow Performance

The migration uses single database connections (not pools) as it's a one-time operation. For large datasets:
- Ensure good network connection between MySQL and PostgreSQL
- Consider running on the same machine as databases
- Monitor database logs for slow queries

### Data Validation Issues

The tool trusts database constraints for validation. If inserts fail:
1. Check PostgreSQL logs for constraint violations
2. Verify foreign key relationships in seed data
3. Ensure data types match schema expectations

## Notes

- This is a **one-time migration tool** - not meant for regular use
- Designed for the initial data import when transitioning from Joomla to the new system
- Uses direct SQL queries for performance (not Prisma ORM)
- Single-threaded execution (no parallel processing)

## License

Private project for VSG Kugelberg e.V.

## Author

René Wagner
