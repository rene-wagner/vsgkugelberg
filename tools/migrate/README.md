# Migration Tool

A one-time migration tool for transferring data from CSV files to the new PostgreSQL database used by the VSG Kugelberg application.

## Overview

This tool performs two main operations:

1. **Seeding**: Populates PostgreSQL with initial data from JSON files
   - Users (2 seed users)
   - Contact persons (10 contact persons)
   - Departments with stats, locations, training groups, and sessions
   - Club history content

2. **Migration**: Migrates legacy content from CSV files to PostgreSQL
   - Categories (hierarchical structure)
   - Blog posts (with automatic slug generation)

## Project Structure

```
tools/migrate/
├── src/
│   ├── index.ts                      # Main entry point with CLI
│   ├── config/
│   │   ├── database.ts               # Database connection configuration
│   │   └── constants.ts              # Constants
│   ├── types/
│   │   ├── database.ts               # Database connection types
│   │   ├── joomla.ts                 # Legacy data types
│   │   ├── seed-data.ts              # Seed data interfaces
│   │   └── index.ts                  # Barrel export
│   ├── utils/
│   │   ├── logger.ts                 # Colored console logging
│   │   ├── timer.ts                  # Time tracking utility
│   │   ├── data-loader.ts            # JSON file loading functions
│   │   └── index.ts                  # Barrel export
│   ├── database/
│   │   ├── csv-loader.ts             # CSV file loading functions
│   │   ├── postgres.ts               # PostgreSQL connection with spinner
│   │   └── index.ts                  # Barrel export
│   ├── seeders/
│   │   ├── user-seeder.ts            # Seeds users
│   │   ├── contact-person-seeder.ts  # Seeds contact persons from JSON
│   │   ├── department-seeder.ts      # Seeds departments and related data
│   │   ├── history-seeder.ts         # Seeds club history
│   │   └── index.ts                  # Barrel export
│   └── migrators/
│       ├── category-migrator.ts      # Migrates categories from CSV
│       ├── post-migrator.ts          # Migrates posts from CSV
│       └── index.ts                  # Barrel export
├── data/
│   ├── categories.csv                # Category data (from legacy system)
│   ├── posts.csv                     # Post data (from legacy system)
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

#### PostgreSQL (Target Database)
```bash
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
```

### CSV Data Files

Place your exported CSV data in the `data/` directory:

- `categories.csv` - Category data with columns: id, name, slug, description, parentId, createdAt, updatedAt
- `posts.csv` - Post data with columns: id, title, content, catid, hits, created, modified, oldPost, authorId, published

### Database Requirements

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
  CSV → PostgreSQL Migration Tool
═══════════════════════════════════════════

✔ Connected to PostgreSQL at localhost:5432

✔ Seeded 2 users
✔ Seeded 15 contact persons
✔ Seeded departments: 4 departments, 16 stats, 8 locations, 6 groups, 13 sessions
✔ Seeded history content
✔ Migrated 8 categories
✔ Migrated 30 posts

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
│ Categories              │ 8          │ ✓ Complete    │
├─────────────────────────┼────────────┼───────────────┤
│ Posts                   │ 30         │ ✓ Complete    │
└─────────────────────────┴────────────┴───────────────┘

Total time: 3.45s

✔ Closed PostgreSQL connection
```

## Architecture

### CSV Loader (`database/csv-loader.ts`)

Loads data from CSV files using fast-csv:

- **loadCategoriesFromCSV()**: Reads `data/categories.csv` and returns JoomlaCategory array
- **loadPostsFromCSV()**: Reads `data/posts.csv` and returns JoomlaPost array

Both functions parse CSV with headers and convert data types appropriately.

### Seeders

Seeders populate PostgreSQL with initial data from JSON files.

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

Migrators transfer data from CSV files to PostgreSQL.

#### Category Migrator (`category-migrator.ts`)
- **Source**: `data/categories.csv`
- **Target**: PostgreSQL `Category` table
- **Features**:
  - Preserves hierarchical parent-child relationships
  - Maps old IDs to new PostgreSQL IDs
  - Warns about missing parent categories (continues execution)

#### Post Migrator (`post-migrator.ts`)
- **Source**: `data/posts.csv`
- **Target**: PostgreSQL `Post` table
- **Features**:
  - Generates URL-friendly slugs from titles using `slugify`
  - Skips duplicate slugs (ON CONFLICT DO NOTHING)
  - Associates posts with migrated categories
- **Behavior**: Iterates through all categories and migrates posts for each

## Seed Data Files

### Editing Categories (`data/categories.csv`)

CSV file with category data:

```csv
id,name,slug,description,parentId,createdAt,updatedAt
1,Allgemein,allgemein,Allgemeine Neuigkeiten,,2024-01-01T00:00:00Z,2024-01-01T00:00:00Z
2,Fußball,fussball,Neuigkeiten aus der Fußballabteilung,,2024-01-01T00:00:00Z,2024-01-01T00:00:00Z
3,Herren,herren,Herrenmannschaft,2,2024-01-01T00:00:00Z,2024-01-01T00:00:00Z
```

**Notes**:
- `id` must be unique
- `slug` must be unique
- `parentId` references another category's id (null for root categories)
- Dates should be in ISO 8601 format

### Editing Posts (`data/posts.csv`)

CSV file with post data:

```csv
id,title,content,catid,hits,created,modified,oldPost,authorId,published
1,"Post Title","<p>HTML content</p>",1,42,2024-01-15T10:00:00Z,2024-01-15T10:00:00Z,1,2,1
```

**Required Fields**:
- `id` - Unique identifier
- `title` - Post title
- `content` - HTML content (can be null)
- `catid` - Category ID (must reference existing category)
- `created` - Creation date (ISO 8601)
- `modified` - Last modified date (ISO 8601)

**Optional Fields**:
- `hits` - View count (default: 0)
- `oldPost` - Flag for old posts (0 or 1)
- `authorId` - Author user ID
- `published` - Published flag (0 or 1)

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
- Missing required CSV files
- SQL constraint violations

### Common Issues

#### Missing Environment Variables
```
Error: Missing required environment variables: POSTGRES_HOST, POSTGRES_PASSWORD
```
**Solution**: Ensure all required env vars are set in `.env`

#### Connection Refused
```
Failed to connect to PostgreSQL
Error: connect ECONNREFUSED 127.0.0.1:5432
```
**Solution**: Verify PostgreSQL is running and credentials are correct

#### Missing CSV Files
```
Error: ENOENT: no such file or directory, open '/path/to/data/categories.csv'
```
**Solution**: Ensure CSV files exist in the `data/` directory

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

### Adding a New CSV Data Source

1. Create new CSV file in `data/new-data.csv`

2. Add type definition in `src/types/joomla.ts`:

```typescript
export interface NewDataType {
  id: number;
  name: string;
  // ... other fields
}
```

3. Add loader function in `src/database/csv-loader.ts`:

```typescript
export async function loadNewDataFromCSV(): Promise<NewDataType[]> {
  return new Promise((resolve, reject) => {
    const data: NewDataType[] = [];
    const filePath = path.join(DATA_DIR, 'new-data.csv');

    fs.createReadStream(filePath)
      .pipe(csv.parse({ headers: true }))
      .on('error', (error) => reject(error))
      .on('data', (row: Record<string, string>) => {
        data.push({
          id: parseInt(row.id, 10),
          name: row.name,
          // ... parse other fields
        });
      })
      .on('end', () => {
        data.sort((a, b) => a.id - b.id);
        resolve(data);
      });
  });
}
```

4. Create migrator in `src/migrators/new-migrator.ts`:

```typescript
import ora from 'ora';
import type { Client } from 'pg';
import { loadNewDataFromCSV } from '../database';

export async function migrateNewData(pgClient: Client): Promise<number> {
  const spinner = ora('Migrating new data...').start();
  
  try {
    const data = await loadNewDataFromCSV();
    let count = 0;
    
    for (const item of data) {
      // Your migration logic here
      count++;
    }
    
    spinner.succeed(`Migrated ${count} records`);
    return count;
  } catch (error) {
    spinner.fail('Failed to migrate new data');
    throw error;
  }
}
```

5. Export and call similarly to existing migrators

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
- Ensure good network connection to PostgreSQL
- Consider running on the same machine as the database
- Monitor database logs for slow queries

### Data Validation Issues

The tool trusts database constraints for validation. If inserts fail:
1. Check PostgreSQL logs for constraint violations
2. Verify foreign key relationships in seed data
3. Ensure data types match schema expectations

## Notes

- This is a **one-time migration tool** - not meant for regular use
- Designed for the initial data import when transitioning from a legacy system to the new system
- Uses direct SQL queries for performance (not Prisma ORM)
- Single-threaded execution (no parallel processing)

## License

Private project for VSG Kugelberg e.V.

## Author

René Wagner
